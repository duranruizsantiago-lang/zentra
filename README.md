# 🛡️ CertFlow — Compliance Automation Platform

**Automatiza la recolección de evidencias de compliance para NIS2, DORA, ISO 27001 y ENS.**

Plataforma full-stack que conecta tus proveedores cloud (GCP, AWS, Azure), escanea automáticamente tus recursos, mapea hallazgos a controles de compliance y genera informes PDF listos para auditoría. Diseñado para PYMEs españolas que necesitan cumplir con NIS2 y DORA sin un equipo de compliance dedicado.

---

## ✨ Features

- **Multi-Cloud Connectors** — Conecta GCP, AWS y Azure. Escaneo automatizado de IAM, storage, networking, logging y KMS.
- **Framework Mapping** — Controles pre-cargados para NIS2, DORA, ISO 27001 y ENS (Esquema Nacional de Seguridad).
- **Compliance Dashboard** — Radar de compliance por framework, KPIs, barras de progreso y timeline de evidencias.
- **Evidence Collection** — Recolección automática de evidencias con estado pass/fail/warn/manual.
- **PDF Report Generation** — Informes profesionales con puntuaciones, hallazgos detallados y formato listo para auditoría.
- **Multi-Tenant** — RBAC con roles admin/member/auditor por organización.
- **Dark Mode Premium** — Interfaz glassmorphism diseñada con principios de UI/UX profesional.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CERTFLOW PLATFORM                         │
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐    ┌────────────┐ │
│  │  Next.js 15      │    │  Go 1.23 API     │    │  Python    │ │
│  │  Frontend        │◄──►│  (Chi Router)    │───►│  Reporter  │ │
│  │  TypeScript      │    │  JWT + RBAC      │    │  Jinja2    │ │
│  │  Tailwind CSS     │    │  PostgreSQL      │    │  WeasyPrint│ │
│  └──────────────────┘    └────────┬─────────┘    └────────────┘ │
│                                    │                             │
│              ┌─────────────────────┼─────────────────────┐       │
│              ▼                     ▼                     ▼       │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐  │
│  │  GCP Connector   │ │  AWS Connector   │ │  Azure Connector │  │
│  │  IAM, KMS,       │ │  S3, EC2,        │ │  Azure AD,       │  │
│  │  Cloud SQL,      │ │  Security Groups, │ │  Security Center,│  │
│  │  Audit Logs      │ │  IAM Policies     │ │  Defender        │  │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘  │
│                                                                  │
│  Frameworks: NIS2 · DORA · ISO 27001 · ENS · CCN-STIC           │
│  Infra: GCP Cloud Run · Cloud SQL · Artifact Registry           │
│  IaC: Terraform · CI/CD: GitHub Actions + Security Gates        │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Go 1.23+
- Node.js 23+
- Docker & Docker Compose
- Python 3.11+ (for reporter)

### Development

```bash
# Clone
git clone https://github.com/duranruizsantiago-lang/zentra.git
cd zentra

# Start infra (PostgreSQL + Redis)
docker compose up -d db redis

# Start API
cd backend
go run ./cmd/server

# Start frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

### One-command (full stack)

```bash
docker compose up --build
```

---

## 📁 Project Structure

```
zentra/
├── backend/                    # Go API (Chi router)
│   ├── cmd/server/main.go     # Entrypoint
│   ├── internal/
│   │   ├── api/               # HTTP handlers + router
│   │   ├── auth/              # JWT auth + RBAC middleware
│   │   ├── collector/         # Evidence collection engine
│   │   ├── connectors/        # GCP, AWS, Azure clients
│   │   ├── models/            # Domain types
│   │   └── store/             # PostgreSQL data layer
│   └── migrations/            # SQL schema + seed data
├── frontend/                   # Next.js 15 + TypeScript
│   └── app/
│       ├── (auth)/            # Login, Register
│       └── (dashboard)/       # Overview, Controls, Evidence, Connectors, Reports, Settings
├── reporter/                   # Python PDF report engine
│   ├── cli.py                 # CLI entrypoint
│   └── templates/             # Jinja2 HTML → PDF templates
├── infra/                      # Terraform (GCP)
│   ├── main.tf                # Cloud Run, Cloud SQL, Artifact Registry, IAM
│   └── variables.tf
├── .github/workflows/ci.yml   # CI/CD + security scanning
├── docker-compose.yml         # Dev environment
├── Dockerfile.api
└── Dockerfile.frontend
```

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | No | Health check |
| `POST` | `/api/v1/auth/register` | No | Register org + admin user |
| `POST` | `/api/v1/auth/login` | No | Login, returns JWT |
| `GET` | `/api/v1/dashboard` | JWT | Compliance dashboard data |
| `GET` | `/api/v1/scores` | JWT | Compliance scores by framework |
| `GET` | `/api/v1/controls?framework=NIS2` | JWT | List controls (filterable) |
| `GET` | `/api/v1/controls/:id/evidence` | JWT | Evidence for a control |
| `GET` | `/api/v1/connectors` | JWT | List cloud connectors |
| `POST` | `/api/v1/connectors` | JWT | Add cloud connector |
| `DELETE` | `/api/v1/connectors/:id` | JWT | Remove connector |
| `POST` | `/api/v1/connectors/:id/scan` | JWT | Trigger compliance scan |
| `GET` | `/api/v1/evidence` | JWT | List evidence (last 50) |
| `GET` | `/api/v1/evidence/:id` | JWT | Get evidence detail |

---

## ☁️ Deployment (GCP)

```bash
cd infra
terraform init
terraform apply -var="project_id=your-gcp-project"
```

Deploys: Cloud Run (API), Cloud SQL (PostgreSQL), Artifact Registry, Secret Manager.

CI/CD via GitHub Actions on push to `main`. Includes:
- Go lint + test + build
- Next.js lint + build + type check
- Trivy vulnerability scan (CRITICAL/HIGH)
- Gitleaks secret scanning
- Deploy to Cloud Run

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| Backend API | Go 1.23, Chi Router, JWT (golang-jwt) |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Reporter | Python 3.11, Jinja2, WeasyPrint |
| Infra | Terraform, GCP (Cloud Run, Cloud SQL, Artifact Registry) |
| CI/CD | GitHub Actions, Trivy, Gitleaks |
| Containers | Docker, Docker Compose |

---

## 🔐 Security

- **JWT Authentication** with refresh tokens (HS256)
- **RBAC** — admin, member, auditor roles
- **bcrypt** password hashing
- **CORS** restricted to frontend origin
- **Request ID** tracing on all API calls
- **SAST + Secret Scanning** in CI/CD pipeline
- **Trivy** vulnerability scanning on every PR

---

## 📊 Supported Compliance Frameworks

| Framework | Controls | Scope |
|-----------|----------|-------|
| **NIS2** | 8+ | EU Network & Information Security |
| **DORA** | 5+ | Digital Operational Resilience Act |
| **ISO 27001** | 5+ | Information Security Management |
| **ENS** | 3+ | Esquema Nacional de Seguridad (España) |

---

## 👤 Author

**Santiago Durán Ruiz**

- GitHub: [@duranruizsantiago-lang](https://github.com/duranruizsantiago-lang)
- Portfolio: Full-stack software engineer specialized in cybersecurity, cloud infrastructure, and compliance automation.

---

## 📄 License

MIT © 2026 Santiago Durán Ruiz
