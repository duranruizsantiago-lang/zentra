"""
Dashboard API

Endpoints for the business dashboard:
- Analytics summary
- Conversation list
- Product management
- Business setup
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta, timezone

from app.models.database import get_session
from app.models.schemas import Business, Product, Customer, Conversation, Message, Event
from app.services.shopify import sync_products

router = APIRouter()


# --- Business Setup ---

@router.post("/businesses")
async def create_business(data: dict, session: AsyncSession = Depends(get_session)):
    """Register a new business (onboarding)."""
    business = Business(
        id=data["id"],
        name=data["name"],
        shopify_domain=data.get("shopify_domain"),
        shopify_access_token=data.get("shopify_access_token"),
        whatsapp_phone_id=data.get("whatsapp_phone_id"),
        whatsapp_number=data.get("whatsapp_number"),
        ai_name=data.get("ai_name", "Asistente"),
        ai_persona=data.get("ai_persona"),
    )
    session.add(business)
    await session.commit()
    return {"status": "created", "business_id": business.id}


@router.get("/businesses/{business_id}")
async def get_business(business_id: str, session: AsyncSession = Depends(get_session)):
    """Get business details."""
    business = await session.get(Business, business_id)
    if not business:
        raise HTTPException(404, "Business not found")
    return {
        "id": business.id,
        "name": business.name,
        "shopify_domain": business.shopify_domain,
        "plan": business.plan,
        "active": business.active,
    }


# --- Product Sync ---

@router.post("/businesses/{business_id}/sync")
async def trigger_sync(business_id: str, session: AsyncSession = Depends(get_session)):
    """Sync products from Shopify."""
    business = await session.get(Business, business_id)
    if not business:
        raise HTTPException(404, "Business not found")

    count = await sync_products(session, business)
    return {"status": "synced", "products_count": count}


@router.get("/businesses/{business_id}/products")
async def list_products(business_id: str, session: AsyncSession = Depends(get_session)):
    """List all products for a business."""
    result = await session.execute(
        select(Product)
        .where(Product.business_id == business_id, Product.active == True)
        .order_by(Product.product_type, Product.title)
    )
    products = result.scalars().all()
    return {
        "count": len(products),
        "products": [
            {
                "title": p.title,
                "price": p.price,
                "stock": p.stock,
                "product_type": p.product_type,
                "image_url": p.image_url,
            }
            for p in products
        ],
    }


# --- Analytics ---

@router.get("/businesses/{business_id}/analytics")
async def get_analytics(business_id: str, days: int = 7, session: AsyncSession = Depends(get_session)):
    """Get analytics summary for a business."""
    since = datetime.now(timezone.utc) - timedelta(days=days)

    # Total conversations
    total_conversations = await session.scalar(
        select(func.count(Conversation.id))
        .where(Conversation.business_id == business_id, Conversation.started_at >= since)
    )

    # Total messages
    total_messages = await session.scalar(
        select(func.count(Event.id))
        .where(
            Event.business_id == business_id,
            Event.event_type == "message_received",
            Event.created_at >= since,
        )
    )

    # Unique customers
    unique_customers = await session.scalar(
        select(func.count(func.distinct(Conversation.customer_phone)))
        .where(Conversation.business_id == business_id, Conversation.started_at >= since)
    )

    # Sales assisted
    sales = await session.scalar(
        select(func.count(Conversation.id))
        .where(
            Conversation.business_id == business_id,
            Conversation.sale_made == True,
            Conversation.started_at >= since,
        )
    )

    # Carts recovered
    carts_recovered = await session.scalar(
        select(func.count(Conversation.id))
        .where(
            Conversation.business_id == business_id,
            Conversation.cart_recovered == True,
            Conversation.started_at >= since,
        )
    )

    # Products — top asked (from events)
    product_events = await session.execute(
        select(Event.data)
        .where(
            Event.business_id == business_id,
            Event.event_type == "product_recommended",
            Event.created_at >= since,
        )
        .limit(100)
    )

    # Low stock alerts
    low_stock = await session.execute(
        select(Product.title, Product.stock)
        .where(Product.business_id == business_id, Product.active == True, Product.stock <= 5)
        .order_by(Product.stock.asc())
        .limit(10)
    )

    return {
        "period_days": days,
        "conversations": total_conversations or 0,
        "messages": total_messages or 0,
        "unique_customers": unique_customers or 0,
        "sales_assisted": sales or 0,
        "carts_recovered": carts_recovered or 0,
        "low_stock_alerts": [{"title": r[0], "stock": r[1]} for r in low_stock.all()],
    }


# --- Conversations ---

@router.get("/businesses/{business_id}/conversations")
async def list_conversations(
    business_id: str, limit: int = 20, session: AsyncSession = Depends(get_session)
):
    """List recent conversations."""
    result = await session.execute(
        select(Conversation)
        .where(Conversation.business_id == business_id)
        .order_by(Conversation.last_message_at.desc())
        .limit(limit)
    )
    conversations = result.scalars().all()

    return {
        "count": len(conversations),
        "conversations": [
            {
                "id": c.id,
                "customer_phone": c.customer_phone,
                "status": c.status,
                "message_count": c.message_count,
                "sale_made": c.sale_made,
                "started_at": c.started_at.isoformat() if c.started_at else None,
                "last_message_at": c.last_message_at.isoformat() if c.last_message_at else None,
            }
            for c in conversations
        ],
    }


@router.get("/conversations/{conversation_id}/messages")
async def get_messages(conversation_id: int, session: AsyncSession = Depends(get_session)):
    """Get all messages in a conversation."""
    result = await session.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
    )
    messages = result.scalars().all()

    return {
        "count": len(messages),
        "messages": [
            {
                "role": m.role,
                "content": m.content,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            }
            for m in messages
        ],
    }
