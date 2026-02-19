"""
Local test script — Simulates the full WhatsApp flow without real APIs.

Usage:
    curl -X POST http://localhost:8000/test/setup
    curl -X POST http://localhost:8000/test/chat -H "Content-Type: application/json" \
         -d '{"message": "Hola, quiero ver pulseras de plata"}'
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from app.models.database import get_session
from app.models.schemas import Business, Product, Customer, Conversation, Message, Event
from app.services.shopify import get_all_products_context
from app.ai.agent import generate_response

router = APIRouter()


@router.post("/setup")
async def setup_test_data(session: AsyncSession = Depends(get_session)):
    """Load test business and products for local development."""

    # Check if already exists
    existing = await session.get(Business, "bisuteria-luna")
    if existing:
        return {"status": "already_exists", "business_id": "bisuteria-luna"}

    # Create test business
    business = Business(
        id="bisuteria-luna",
        name="Luna Bisutería",
        ai_name="Luna",
        ai_persona=(
            "Eres Luna, la asistente virtual de Luna Bisutería, una tienda online de bisutería "
            "artesanal para mujer. Eres cercana, simpática y tienes buen gusto. Hablas como una "
            "amiga que recomienda joyas, no como una vendedora agresiva. Usas un tono cálido y "
            "femenino. Tu objetivo es ayudar a las clientas a encontrar la pieza perfecta."
        ),
    )
    session.add(business)

    # Create test products
    test_products = [
        Product(
            business_id="bisuteria-luna",
            shopify_product_id="prod-001",
            shopify_variant_id="var-001",
            title="Pulsera Estrella de Plata 925",
            description="Pulsera artesanal con colgante de estrella en plata de ley 925. Cadena ajustable.",
            price=24.90,
            compare_at_price=34.90,
            stock=15,
            image_url="https://example.com/pulsera-estrella.jpg",
            product_url="https://luna-bisuteria.myshopify.com/products/pulsera-estrella",
            product_type="Pulseras",
            tags="plata,estrella,regalo,bestseller",
        ),
        Product(
            business_id="bisuteria-luna",
            shopify_product_id="prod-002",
            shopify_variant_id="var-002",
            title="Collar Luna Creciente Dorado",
            description="Collar con colgante de luna creciente bañado en oro de 18K. Largo: 45cm.",
            price=29.90,
            stock=8,
            image_url="https://example.com/collar-luna.jpg",
            product_url="https://luna-bisuteria.myshopify.com/products/collar-luna",
            product_type="Collares",
            tags="dorado,luna,elegante",
        ),
        Product(
            business_id="bisuteria-luna",
            shopify_product_id="prod-003",
            shopify_variant_id="var-003",
            title="Pendientes Aro Trenzado Plata",
            description="Pendientes de aro con diseño trenzado en plata de ley. Diámetro: 3cm.",
            price=19.90,
            compare_at_price=27.90,
            stock=22,
            image_url="https://example.com/pendientes-aro.jpg",
            product_url="https://luna-bisuteria.myshopify.com/products/pendientes-aro",
            product_type="Pendientes",
            tags="plata,aro,casual,bestseller",
        ),
        Product(
            business_id="bisuteria-luna",
            shopify_product_id="prod-004",
            shopify_variant_id="var-004",
            title="Anillo Mariposa Rosado",
            description="Anillo ajustable con mariposa en cristal rosado. Bañado en oro rosa.",
            price=16.90,
            stock=30,
            image_url="https://example.com/anillo-mariposa.jpg",
            product_url="https://luna-bisuteria.myshopify.com/products/anillo-mariposa",
            product_type="Anillos",
            tags="oro rosa,mariposa,ajustable,regalo",
        ),
        Product(
            business_id="bisuteria-luna",
            shopify_product_id="prod-005",
            shopify_variant_id="var-005",
            title="Set Regalo Plata — Pulsera + Pendientes",
            description="Set de regalo con pulsera y pendientes en plata de ley 925. Incluye cajita de regalo.",
            price=39.90,
            compare_at_price=52.80,
            stock=5,
            image_url="https://example.com/set-regalo.jpg",
            product_url="https://luna-bisuteria.myshopify.com/products/set-regalo-plata",
            product_type="Sets",
            tags="plata,regalo,oferta,set,envio gratis",
        ),
        Product(
            business_id="bisuteria-luna",
            shopify_product_id="prod-006",
            shopify_variant_id="var-006",
            title="Tobillera Conchitas de Mar",
            description="Tobillera artesanal con conchas naturales y cuentas turquesa. Ajustable.",
            price=14.90,
            stock=18,
            image_url="https://example.com/tobillera-conchitas.jpg",
            product_url="https://luna-bisuteria.myshopify.com/products/tobillera-conchitas",
            product_type="Tobilleras",
            tags="verano,playa,conchitas,boho",
        ),
    ]

    for p in test_products:
        session.add(p)

    await session.commit()
    return {"status": "created", "business_id": "bisuteria-luna", "products": len(test_products)}


@router.post("/chat")
async def test_chat(data: dict, session: AsyncSession = Depends(get_session)):
    """
    Simulate a WhatsApp chat without real WhatsApp API.
    Send: {"message": "Hola, quiero ver pulseras de plata"}
    Returns the AI response.
    """
    customer_message = data.get("message", "")
    business_id = data.get("business_id", "bisuteria-luna")
    customer_phone = data.get("phone", "+34600000000")

    business = await session.get(Business, business_id)
    if not business:
        return {"error": f"Business '{business_id}' not found. Run POST /test/setup first."}

    # Get or create test customer
    from sqlalchemy import select
    result = await session.execute(
        select(Customer).where(Customer.business_id == business_id, Customer.phone == customer_phone)
    )
    customer = result.scalar_one_or_none()
    if not customer:
        customer = Customer(business_id=business_id, phone=customer_phone, name="Test Customer")
        session.add(customer)
        await session.flush()

    # Get or create conversation
    result = await session.execute(
        select(Conversation)
        .where(Conversation.business_id == business_id, Conversation.customer_phone == customer_phone, Conversation.status == "active")
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        conversation = Conversation(business_id=business_id, customer_id=customer.id, customer_phone=customer_phone)
        session.add(conversation)
        await session.flush()

    # Save customer message
    session.add(Message(conversation_id=conversation.id, role="customer", content=customer_message))

    # Load catalog
    catalog = await get_all_products_context(session, business_id)

    # Load history
    result = await session.execute(
        select(Message).where(Message.conversation_id == conversation.id).order_by(Message.created_at.desc()).limit(10)
    )
    messages = result.scalars().all()
    history = [{"role": m.role if m.role != "customer" else "user", "content": m.content} for m in reversed(messages)]

    # Generate AI response
    ai_response = await generate_response(
        business_name=business.name,
        ai_name=business.ai_name,
        ai_persona=business.ai_persona,
        catalog=catalog,
        conversation_history=history,
        customer_message=customer_message,
    )

    # Save AI response
    session.add(Message(conversation_id=conversation.id, role="assistant", content=ai_response))
    conversation.message_count += 1
    await session.commit()

    return {
        "customer": customer_message,
        "assistant": ai_response,
        "conversation_id": conversation.id,
    }
