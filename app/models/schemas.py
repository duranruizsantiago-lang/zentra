"""
Database models — Multi-tenant e-commerce automation platform.

All tables are scoped to a business_id for multi-tenant isolation.
"""

from sqlalchemy import Column, String, Float, Integer, BigInteger, DateTime, Text, JSON, Boolean, ForeignKey, Index
from sqlalchemy.sql import func
from app.models.database import Base


class Business(Base):
    """A client business (e-commerce store)."""
    __tablename__ = "businesses"

    id = Column(String, primary_key=True)  # e.g. "bisuteria-maria"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Business info
    name = Column(String, nullable=False)
    shopify_domain = Column(String, nullable=True)  # "tienda.myshopify.com"
    shopify_access_token = Column(String, nullable=True)

    # WhatsApp config
    whatsapp_phone_id = Column(String, nullable=True)
    whatsapp_number = Column(String, nullable=True)  # "+34600111222"

    # AI personality
    ai_name = Column(String, default="Asistente")
    ai_persona = Column(Text, nullable=True)  # Custom prompt for the AI
    ai_language = Column(String, default="es")

    # Plan
    plan = Column(String, default="starter")  # starter, growth, scale
    active = Column(Boolean, default=True)


class Product(Base):
    """Product synced from Shopify."""
    __tablename__ = "products"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    business_id = Column(String, ForeignKey("businesses.id"), nullable=False)
    shopify_product_id = Column(String, nullable=False)
    shopify_variant_id = Column(String, nullable=True)

    # Product info
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    compare_at_price = Column(Float, nullable=True)  # Original price (for discounts)
    currency = Column(String, default="EUR")
    image_url = Column(String, nullable=True)
    product_url = Column(String, nullable=True)

    # Inventory
    stock = Column(Integer, default=0)
    sku = Column(String, nullable=True)

    # Categorization
    product_type = Column(String, nullable=True)  # "Pulseras", "Collares"
    tags = Column(String, nullable=True)  # comma-separated
    vendor = Column(String, nullable=True)

    # Status
    active = Column(Boolean, default=True)
    synced_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("ix_products_business", "business_id"),
        Index("ix_products_shopify", "business_id", "shopify_product_id"),
    )


class Customer(Base):
    """A customer who has interacted via WhatsApp."""
    __tablename__ = "customers"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    business_id = Column(String, ForeignKey("businesses.id"), nullable=False)

    phone = Column(String, nullable=False)  # WhatsApp number
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    shopify_customer_id = Column(String, nullable=True)

    # Aggregated metrics
    total_conversations = Column(Integer, default=0)
    total_orders = Column(Integer, default=0)
    total_spent = Column(Float, default=0.0)
    last_contact_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("ix_customers_phone", "business_id", "phone", unique=True),
    )


class Conversation(Base):
    """A WhatsApp conversation session with a customer."""
    __tablename__ = "conversations"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    business_id = Column(String, ForeignKey("businesses.id"), nullable=False)
    customer_id = Column(BigInteger, ForeignKey("customers.id"), nullable=True)
    customer_phone = Column(String, nullable=False)

    # Conversation state
    status = Column(String, default="active")  # active, resolved, escalated
    context = Column(JSON, nullable=True)  # Carries state between messages (cart, intent, etc.)

    # Metrics
    message_count = Column(Integer, default=0)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    last_message_at = Column(DateTime(timezone=True), server_default=func.now())

    # Attribution
    sale_made = Column(Boolean, default=False)
    sale_amount = Column(Float, nullable=True)
    cart_recovered = Column(Boolean, default=False)

    __table_args__ = (
        Index("ix_conversations_business", "business_id"),
        Index("ix_conversations_customer", "business_id", "customer_phone"),
    )


class Message(Base):
    """Individual message in a conversation."""
    __tablename__ = "messages"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    conversation_id = Column(BigInteger, ForeignKey("conversations.id"), nullable=False)

    role = Column(String, nullable=False)  # "customer", "assistant", "system"
    content = Column(Text, nullable=False)
    whatsapp_msg_id = Column(String, nullable=True)  # Meta message ID

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("ix_messages_conversation", "conversation_id"),
    )


class Event(Base):
    """Trackable business events for analytics."""
    __tablename__ = "events"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    business_id = Column(String, ForeignKey("businesses.id"), nullable=False)

    # Event type
    event_type = Column(String, nullable=False)
    # Types: message_received, message_sent, product_recommended,
    #        cart_abandoned, cart_recovered, sale_assisted,
    #        question_asked, escalated_to_human, stock_alert

    # Event data
    data = Column(JSON, nullable=True)
    customer_phone = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("ix_events_business_type", "business_id", "event_type"),
        Index("ix_events_created", "business_id", "created_at"),
    )
