"""
AI Sales Agent

Uses Claude Sonnet to power an intelligent sales assistant that:
- Recommends products based on customer messages
- Answers FAQs about shipping, returns, materials
- Recovers abandoned carts with personalized follow-ups
- Knows the full product catalog via RAG
- Speaks natural Spanish (not translated)

The agent maintains conversation context and adapts its tone
to match the business's brand personality.
"""

import anthropic
from app.config import settings


def build_system_prompt(business_name: str, ai_name: str, ai_persona: str, catalog: str) -> str:
    """
    Build the system prompt for the sales agent.
    This is the brain of the product — it defines how the AI sells.
    """
    persona_section = ai_persona or f"Eres una asistente de ventas amable y profesional de {business_name}."

    return f"""Eres {ai_name}, la asistente virtual de ventas de {business_name} por WhatsApp.

## Tu personalidad
{persona_section}

## Reglas ESTRICTAS
1. SOLO vendes productos del catálogo de abajo. Si no tienes un producto, di "No tenemos eso, pero mira esto que te puede gustar:" y recomienda algo similar.
2. SIEMPRE incluye el precio cuando mencionas un producto.
3. Si el producto tiene descuento, menciónalo: "Antes costaba X€, ahora está a Y€ — ¡Z% de descuento!"
4. Cuando el cliente muestre interés, envía el link de compra directa.
5. Responde SIEMPRE en español de España (no latinoamericano).
6. Sé concisa — mensajes cortos tipo WhatsApp, no párrafos largos.
7. Usa emojis con moderación (1-2 por mensaje máximo).
8. Si el cliente pregunta algo que no sabes (envíos internacionales, garantía especial), di: "Deja que lo consulte con el equipo y te confirmo enseguida 😊"
9. NUNCA inventes información sobre productos, precios o stock.
10. Si el cliente se despide o no quiere comprar, responde amablemente sin insistir.

## Información de envíos y devoluciones
- Envío estándar: 3-5 días laborables
- Envío gratis a partir de 30€
- Devoluciones: 14 días desde la entrega
- Cambios: gratuitos
- Método de pago: tarjeta, Bizum, PayPal

## Catálogo de productos
{catalog}

## Formato de respuesta
Responde SOLO con el texto del mensaje de WhatsApp. Sin formato markdown.
Cuando recomiendes un producto, usa este formato:

✨ [Nombre del producto]
💰 [Precio] (incluye descuento si lo hay)
🔗 [Link de compra]

Si recomiendas varios productos, máximo 3 a la vez."""


async def generate_response(
    business_name: str,
    ai_name: str,
    ai_persona: str,
    catalog: str,
    conversation_history: list[dict],
    customer_message: str,
) -> str:
    """
    Generate an AI response using Claude Sonnet.

    conversation_history: [{"role": "user"|"assistant", "content": "..."}]
    Returns the assistant's response text.
    """
    if not settings.anthropic_api_key:
        return _fallback_response(customer_message)

    system_prompt = build_system_prompt(business_name, ai_name, ai_persona, catalog)

    # Build messages: history + new message
    messages = []
    for msg in conversation_history[-10:]:  # Last 10 messages for context
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": customer_message})

    try:
        client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
        response = await client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=500,
            system=system_prompt,
            messages=messages,
        )
        return response.content[0].text

    except Exception as e:
        print(f"❌ Claude API error: {e}")
        return _fallback_response(customer_message)


def _fallback_response(message: str) -> str:
    """Fallback response when AI is unavailable."""
    msg_lower = message.lower()

    if any(w in msg_lower for w in ["hola", "buenas", "buenos", "hey"]):
        return "¡Hola! 👋 Bienvenida a nuestra tienda. ¿En qué puedo ayudarte?"

    if any(w in msg_lower for w in ["envio", "envío", "cuanto tarda"]):
        return "📦 Envío estándar en 3-5 días laborables. ¡Gratis a partir de 30€!"

    if any(w in msg_lower for w in ["devol", "cambio", "cambiar"]):
        return "Tienes 14 días para devoluciones y los cambios son gratuitos 😊"

    if any(w in msg_lower for w in ["precio", "cuanto", "cuánto", "cuesta"]):
        return "¿Qué producto te interesa? Dime y te doy el precio con todos los detalles 😊"

    return "¡Gracias por tu mensaje! Déjame un momento que lo consulto y te respondo enseguida 😊"
