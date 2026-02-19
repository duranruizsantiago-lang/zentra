# 🛒 VendIA — AI Sales Agent for E-commerce

**WhatsApp-native AI sales assistant that turns conversations into conversions.**

VendIA connects to your Shopify store and WhatsApp Business to create an intelligent sales agent that recommends products, answers questions, recovers abandoned carts, and closes sales — 24/7, in natural Spanish.

---

## Architecture

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐
│ WhatsApp │◄───►│   FastAPI     │◄───►│  Shopify API    │
│ Customer │     │   Backend     │     │  (catalog,      │
│          │     │              │     │   orders, stock) │
└──────────┘     └──────┬───────┘     └─────────────────┘
                        │
                   ┌────┴────┐
                   │ Claude  │ ← RAG over product catalog
                   │ Sonnet  │
                   └────┬────┘
                        │
             ┌──────────┴──────────┐
             │    PostgreSQL       │
             │  (customers, chats, │
             │   products, events) │
             └──────────┬──────────┘
                        │
             ┌──────────┴──────────┐
             │   Dashboard API     │
             │  (analytics, KPIs)  │
             └─────────────────────┘
```

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/vendia.git
cd vendia
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
docker compose up --build
```

### Test without real APIs

```bash
# 1. Load test data (fake jewelry store)
curl -X POST http://localhost:8000/test/setup

# 2. Chat with the AI
curl -X POST http://localhost:8000/test/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola, busco un regalo para mi madre"}'

# 3. Check analytics
curl http://localhost:8000/api/businesses/bisuteria-luna/analytics
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python 3.11) |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| AI | Claude Sonnet (Anthropic API) |
| Messaging | WhatsApp Business Cloud API |
| E-commerce | Shopify Admin API |
| Containers | Docker Compose |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/webhooks/whatsapp` | WhatsApp verification |
| POST | `/webhooks/whatsapp` | Incoming WhatsApp messages |
| POST | `/api/businesses` | Register new business |
| POST | `/api/businesses/{id}/sync` | Sync Shopify products |
| GET | `/api/businesses/{id}/products` | List products |
| GET | `/api/businesses/{id}/analytics` | Dashboard analytics |
| GET | `/api/businesses/{id}/conversations` | List conversations |
| GET | `/api/conversations/{id}/messages` | Conversation messages |
| POST | `/test/setup` | Load test data |
| POST | `/test/chat` | Test chat without WhatsApp |

## License

MIT
