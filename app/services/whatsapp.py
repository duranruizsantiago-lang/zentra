"""
WhatsApp Cloud API Service

Sends and receives messages via Meta's WhatsApp Business Cloud API.
Handles text messages, images, interactive buttons, and product carousels.
"""

import httpx
from app.config import settings

WHATSAPP_API_URL = "https://graph.facebook.com/v21.0"


async def send_text(phone_id: str, token: str, to: str, text: str) -> dict:
    """Send a text message."""
    url = f"{WHATSAPP_API_URL}/{phone_id}/messages"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {"body": text},
    }

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(url, json=payload, headers=headers)
        resp.raise_for_status()
        return resp.json()


async def send_image(phone_id: str, token: str, to: str, image_url: str, caption: str = "") -> dict:
    """Send an image with optional caption."""
    url = f"{WHATSAPP_API_URL}/{phone_id}/messages"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "image",
        "image": {"link": image_url, "caption": caption},
    }

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(url, json=payload, headers=headers)
        resp.raise_for_status()
        return resp.json()


async def send_buttons(phone_id: str, token: str, to: str, body: str, buttons: list[dict]) -> dict:
    """
    Send an interactive message with buttons.
    buttons: [{"id": "btn_1", "title": "Ver más"}]  (max 3 buttons, title max 20 chars)
    """
    url = f"{WHATSAPP_API_URL}/{phone_id}/messages"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "interactive",
        "interactive": {
            "type": "button",
            "body": {"text": body},
            "action": {
                "buttons": [
                    {"type": "reply", "reply": {"id": b["id"], "title": b["title"][:20]}}
                    for b in buttons[:3]
                ]
            },
        },
    }

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(url, json=payload, headers=headers)
        resp.raise_for_status()
        return resp.json()


async def send_product_message(
    phone_id: str,
    token: str,
    to: str,
    product: dict,
) -> dict:
    """
    Send a product recommendation with image + buy button.
    """
    price_text = f"{product['price']}€"
    if product.get("compare_at_price") and product["compare_at_price"] > product["price"]:
        discount = round((1 - product["price"] / product["compare_at_price"]) * 100)
        price_text = f"~~{product['compare_at_price']}€~~ {product['price']}€ (-{discount}%)"

    caption = f"*{product['title']}*\n💰 {price_text}\n📦 {product.get('stock', '?')} disponibles"

    # Send image with caption
    if product.get("image_url"):
        await send_image(phone_id, token, to, product["image_url"], caption)

    # Send buy button
    await send_buttons(phone_id, token, to, "¿Te interesa este producto?", [
        {"id": f"buy_{product.get('title', '')[:10]}", "title": "🛒 Comprar"},
        {"id": "more_products", "title": "Ver más"},
        {"id": "talk_human", "title": "👤 Hablar"},
    ])


def extract_message(webhook_data: dict) -> dict | None:
    """
    Extract the customer message from a WhatsApp webhook payload.
    Returns: {"from": "34600...", "type": "text", "text": "...", "msg_id": "..."} or None.
    """
    try:
        entry = webhook_data["entry"][0]
        changes = entry["changes"][0]
        value = changes["value"]

        if "messages" not in value:
            return None  # Status update, not a message

        msg = value["messages"][0]
        contact = value["contacts"][0]
        metadata = value["metadata"]

        result = {
            "from": msg["from"],
            "name": contact.get("profile", {}).get("name", ""),
            "type": msg["type"],
            "msg_id": msg["id"],
            "phone_id": metadata["phone_number_id"],
            "timestamp": msg.get("timestamp", ""),
        }

        if msg["type"] == "text":
            result["text"] = msg["text"]["body"]
        elif msg["type"] == "interactive":
            interactive = msg.get("interactive", {})
            if interactive.get("type") == "button_reply":
                result["text"] = interactive["button_reply"]["id"]
                result["button_title"] = interactive["button_reply"]["title"]
            elif interactive.get("type") == "list_reply":
                result["text"] = interactive["list_reply"]["id"]
        elif msg["type"] == "image":
            result["text"] = msg.get("image", {}).get("caption", "[imagen]")
        else:
            result["text"] = f"[{msg['type']}]"

        return result

    except (KeyError, IndexError):
        return None
