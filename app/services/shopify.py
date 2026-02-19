"""
Shopify Integration Service

Syncs products, handles webhooks for orders and abandoned carts,
and provides product search for the AI assistant.
"""

import httpx
from typing import Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.schemas import Business, Product


SHOPIFY_API_VERSION = "2024-10"


def _shopify_headers(access_token: str) -> dict:
    return {
        "X-Shopify-Access-Token": access_token,
        "Content-Type": "application/json",
    }


def _shopify_url(domain: str, endpoint: str) -> str:
    return f"https://{domain}/admin/api/{SHOPIFY_API_VERSION}/{endpoint}"


async def sync_products(session: AsyncSession, business: Business) -> int:
    """
    Sync all products from Shopify to local database.
    Returns count of products synced.
    """
    if not business.shopify_domain or not business.shopify_access_token:
        raise ValueError("Business missing Shopify credentials")

    url = _shopify_url(business.shopify_domain, "products.json?limit=250&status=active")
    headers = _shopify_headers(business.shopify_access_token)

    synced = 0
    async with httpx.AsyncClient(timeout=30) as client:
        while url:
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
            data = resp.json()

            for product in data.get("products", []):
                for variant in product.get("variants", []):
                    # Upsert product variant
                    existing = await session.execute(
                        select(Product).where(
                            Product.business_id == business.id,
                            Product.shopify_product_id == str(product["id"]),
                            Product.shopify_variant_id == str(variant["id"]),
                        )
                    )
                    existing_product = existing.scalar_one_or_none()

                    image_url = None
                    if product.get("images"):
                        image_url = product["images"][0]["src"]

                    product_url = f"https://{business.shopify_domain}/products/{product['handle']}"

                    if existing_product:
                        existing_product.title = product["title"]
                        if variant.get("title") != "Default Title":
                            existing_product.title += f" - {variant['title']}"
                        existing_product.description = product.get("body_html", "")
                        existing_product.price = float(variant.get("price", 0))
                        existing_product.compare_at_price = float(variant["compare_at_price"]) if variant.get("compare_at_price") else None
                        existing_product.stock = variant.get("inventory_quantity", 0)
                        existing_product.sku = variant.get("sku", "")
                        existing_product.image_url = image_url
                        existing_product.product_url = product_url
                        existing_product.product_type = product.get("product_type", "")
                        existing_product.tags = product.get("tags", "")
                        existing_product.vendor = product.get("vendor", "")
                        existing_product.active = True
                    else:
                        title = product["title"]
                        if variant.get("title") != "Default Title":
                            title += f" - {variant['title']}"

                        new_product = Product(
                            business_id=business.id,
                            shopify_product_id=str(product["id"]),
                            shopify_variant_id=str(variant["id"]),
                            title=title,
                            description=product.get("body_html", ""),
                            price=float(variant.get("price", 0)),
                            compare_at_price=float(variant["compare_at_price"]) if variant.get("compare_at_price") else None,
                            stock=variant.get("inventory_quantity", 0),
                            sku=variant.get("sku", ""),
                            image_url=image_url,
                            product_url=product_url,
                            product_type=product.get("product_type", ""),
                            tags=product.get("tags", ""),
                            vendor=product.get("vendor", ""),
                            active=True,
                        )
                        session.add(new_product)

                    synced += 1

            await session.commit()

            # Handle pagination
            link_header = resp.headers.get("link", "")
            url = None
            if 'rel="next"' in link_header:
                for part in link_header.split(","):
                    if 'rel="next"' in part:
                        url = part.split("<")[1].split(">")[0]

    print(f"✅ Synced {synced} products for {business.name}")
    return synced


async def search_products(
    session: AsyncSession,
    business_id: str,
    query: str,
    limit: int = 5,
) -> list[dict]:
    """
    Search products by title, type, or tags.
    Returns list of product dicts for AI context.
    """
    search_term = f"%{query.lower()}%"

    result = await session.execute(
        select(Product)
        .where(
            Product.business_id == business_id,
            Product.active == True,
            Product.stock > 0,
        )
        .where(
            Product.title.ilike(search_term)
            | Product.product_type.ilike(search_term)
            | Product.tags.ilike(search_term)
            | Product.description.ilike(search_term)
        )
        .order_by(Product.stock.desc())
        .limit(limit)
    )

    products = result.scalars().all()
    return [
        {
            "title": p.title,
            "price": p.price,
            "compare_at_price": p.compare_at_price,
            "stock": p.stock,
            "image_url": p.image_url,
            "product_url": p.product_url,
            "product_type": p.product_type,
            "tags": p.tags,
        }
        for p in products
    ]


async def get_all_products_context(
    session: AsyncSession,
    business_id: str,
) -> str:
    """
    Get a text summary of all products for AI context.
    Used as the knowledge base for the assistant.
    """
    result = await session.execute(
        select(Product)
        .where(Product.business_id == business_id, Product.active == True)
        .order_by(Product.product_type, Product.title)
    )
    products = result.scalars().all()

    if not products:
        return "No hay productos cargados todavía."

    lines = []
    current_type = None
    for p in products:
        if p.product_type != current_type:
            current_type = p.product_type
            lines.append(f"\n## {current_type or 'General'}")

        stock_text = f"{p.stock} unidades" if p.stock > 0 else "AGOTADO"
        price_text = f"{p.price}€"
        if p.compare_at_price and p.compare_at_price > p.price:
            discount = round((1 - p.price / p.compare_at_price) * 100)
            price_text += f" (antes {p.compare_at_price}€, {discount}% dto)"

        lines.append(f"- {p.title}: {price_text} | Stock: {stock_text} | Link: {p.product_url}")

    return "\n".join(lines)


async def get_checkout_url(domain: str, variant_id: str, quantity: int = 1) -> str:
    """Generate a direct checkout URL for a product variant."""
    return f"https://{domain}/cart/{variant_id}:{quantity}"
