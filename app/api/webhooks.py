"""
WhatsApp Webhook Handler

Receives incoming WhatsApp messages, processes them through the AI agent,
and sends back responses. This is the core of the product.

Flow:
1. Meta sends webhook → we extract the message
2. Find or create customer + conversation in DB
3. Load product catalog for the business
4. Build conversation history from DB
5. Send to Claude for AI response
6. Save messages to DB
7. Send response back via WhatsApp API
"""

from fastapi import APIRouter, Request, Response, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from app.config import settings
from app.models.database import get_session
from app.models.schemas import Business, Customer, Conversation, Message, Event
from app.services.whatsapp import extract_message, send_text
from app.services.shopify import get_all_products_context
from app.ai.agent import generate_response

router = APIRouter()


@router.get("/whatsapp")
async def verify_webhook(request: Request):
    """
    WhatsApp webhook verification (required by Meta).
    Meta sends a GET request with a challenge to verify ownership.
    """
    params = request.query_params
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    if mode == "subscribe" and token == settings.whatsapp_verify_token:
        print(f"✅ Webhook verified")
        return Response(content=challenge, media_type="text/plain")

    return Response(content="Forbidden", status_code=403)


@router.post("/whatsapp")
async def handle_message(request: Request, session: AsyncSession = Depends(get_session)):
    """
    Handle incoming WhatsApp messages.
    This is where every customer interaction flows through.
    """
    payload = await request.json()

    # Extract message from webhook payload
    msg = extract_message(payload)
    if not msg:
        return {"status": "ok"}  # Status update or non-message event

    customer_phone = msg["from"]
    customer_name = msg.get("name", "")
    customer_text = msg.get("text", "")
    phone_id = msg["phone_id"]

    print(f"📩 Message from {customer_phone}: {customer_text[:80]}")

    # Find business by WhatsApp phone ID
    business = await _get_business_by_phone(session, phone_id)
    if not business:
        print(f"⚠️ No business found for phone_id {phone_id}")
        return {"status": "ok"}

    # Find or create customer
    customer = await _get_or_create_customer(session, business.id, customer_phone, customer_name)

    # Find or create conversation
    conversation = await _get_or_create_conversation(session, business.id, customer)

    # Save incoming message
    incoming_msg = Message(
        conversation_id=conversation.id,
        role="customer",
        content=customer_text,
        whatsapp_msg_id=msg.get("msg_id"),
    )
    session.add(incoming_msg)

    # Track event
    session.add(Event(
        business_id=business.id,
        event_type="message_received",
        data={"text": customer_text[:200], "type": msg["type"]},
        customer_phone=customer_phone,
    ))

    # Load product catalog
    catalog = await get_all_products_context(session, business.id)

    # Load conversation history
    history = await _get_conversation_history(session, conversation.id)

    # Generate AI response
    ai_response = await generate_response(
        business_name=business.name,
        ai_name=business.ai_name or "Asistente",
        ai_persona=business.ai_persona or "",
        catalog=catalog,
        conversation_history=history,
        customer_message=customer_text,
    )

    # Save AI response
    outgoing_msg = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=ai_response,
    )
    session.add(outgoing_msg)

    # Update conversation
    conversation.message_count += 1
    conversation.last_message_at = datetime.now(timezone.utc)

    # Track event
    session.add(Event(
        business_id=business.id,
        event_type="message_sent",
        data={"text": ai_response[:200]},
        customer_phone=customer_phone,
    ))

    await session.commit()

    # Send response via WhatsApp
    try:
        token = business.whatsapp_phone_id and settings.whatsapp_token
        if token:
            await send_text(business.whatsapp_phone_id, settings.whatsapp_token, customer_phone, ai_response)
            print(f"📤 Reply sent to {customer_phone}")
        else:
            print(f"⚠️ WhatsApp not configured for {business.name}, response saved only")
    except Exception as e:
        print(f"❌ WhatsApp send error: {e}")

    return {"status": "ok"}


# --- Helper functions ---

async def _get_business_by_phone(session: AsyncSession, phone_id: str) -> Business | None:
    """Find business by WhatsApp phone number ID."""
    result = await session.execute(
        select(Business).where(Business.whatsapp_phone_id == phone_id, Business.active == True)
    )
    return result.scalar_one_or_none()


async def _get_or_create_customer(
    session: AsyncSession, business_id: str, phone: str, name: str
) -> Customer:
    """Find or create a customer by phone number."""
    result = await session.execute(
        select(Customer).where(Customer.business_id == business_id, Customer.phone == phone)
    )
    customer = result.scalar_one_or_none()

    if not customer:
        customer = Customer(
            business_id=business_id,
            phone=phone,
            name=name,
        )
        session.add(customer)
        await session.flush()
        print(f"👤 New customer: {name or phone}")

    customer.last_contact_at = datetime.now(timezone.utc)
    customer.total_conversations += 1
    return customer


async def _get_or_create_conversation(
    session: AsyncSession, business_id: str, customer: Customer
) -> Conversation:
    """Get active conversation or create new one."""
    result = await session.execute(
        select(Conversation)
        .where(
            Conversation.business_id == business_id,
            Conversation.customer_phone == customer.phone,
            Conversation.status == "active",
        )
        .order_by(Conversation.last_message_at.desc())
    )
    conversation = result.scalar_one_or_none()

    if not conversation:
        conversation = Conversation(
            business_id=business_id,
            customer_id=customer.id,
            customer_phone=customer.phone,
        )
        session.add(conversation)
        await session.flush()

    return conversation


async def _get_conversation_history(session: AsyncSession, conversation_id: int) -> list[dict]:
    """Load last 10 messages for AI context."""
    result = await session.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(10)
    )
    messages = result.scalars().all()

    return [
        {"role": m.role if m.role != "customer" else "user", "content": m.content}
        for m in reversed(messages)
    ]
