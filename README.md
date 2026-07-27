# 🛡️ CertFlow — Compliance Automation Platform

<p align="center">
  <img src="https://img.shields.io/badge/Go-1.23-00ADD8?logo=go" alt="Go">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TS">
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Terraform-GCP-844FBA?logo=terraform" alt="Terraform">
  <img src="https://img.shields.io/badge/Docker-ready-2496ED?logo=docker" alt="Docker">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
</p>

**Automated compliance evidence collection for NIS2, DORA, ISO 27001 & ENS.**

Full-stack platform that connects to your cloud providers (GCP, AWS, Azure), scans your infrastructure, maps findings to compliance controls, and generates audit-ready PDF reports. Built for Spanish SMEs facing NIS2/DORA deadlines.

---

## 👀 Try It In 2 Minutes

```bash
# 1. Clone & start
git clone https://github.com/duranruizsantiago-lang/zentra.git
cd zentra
docker compose up --build

# 2. Seed demo data (opens another terminal)
./scripts/demo-seed.sh

# 3. Open browser
open http://localhost:3000/login
# Email: demo@certflow.io
# Password: Demo1234!
```

The seed script populates the platform with simulated GCP & AWS scans. You'll see a live compliance dashboard with evidence across NIS2, DORA, ISO 27001, and ENS frameworks.

---

## ✨ Features

- **Multi-Cloud Connectors** — GCP, AWS, Azure. Automated scanning of IAM, storage, networking, KMS, and audit logging.
- **Framework Mapping** — Pre-loaded controls for NIS2 (8), DORA (5), ISO 27001 (5), and ENS (3). Extensible.
- **Compliance Dashboard** — Framework scores, KPI cards, progress bars, pass/fail/warn breakdowns.
- **Evidence Collection** — Automatic evidence collection with pass/fail/warn/manual status.
- **PDF Reports** — Professional audit reports with scores and detailed findings via Jinja2 + WeasyPrint.
- **Multi-Tenant RBAC** — Organizations with admin, member, and auditor roles.
- **Premium UI** — Dark mode with glassmorphism, responsive sidebar, polished UX.
- **CI/CD + Security** — GitHub Actions with Trivy vulnerability scanning and Gitleaks secret detection.

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
│  Frameworks: NIS2 · DORA · ISO 27001 · ENS                       │
│  Infra: GCP Cloud Run · Cloud SQL · Artifact Registry           │
│  IaC: Terraform · CI/CD: GitHub Actions + Security Gates        │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (Development)

### Prerequisites

- Docker & Docker Compose (easiest)
- Or: Go 1.23+, Node.js 23+, Python 3.11+

### Docker (recommended)

```bash
git clone https://github.com/duranruizsantiago-lang/zentra.git
cd zentra
cp .env.example .env
docker compose up --build
```

Open http://localhost:3000

### Seed Demo Data

```bash
./scripts/demo-seed.sh
```

This creates an organization, adds GCP + AWS connectors, runs scans, and populates evidence.

### Without Docker

```bash
# Terminal 1 — Database
docker compose up -d db redis

# Terminal 2 — API
cd backend
cp ../.env.example ../.env
go run ./cmd/server

# Terminal 3 — Frontend
cd frontend
npm install && npm run dev
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
│   └── migrations/            # SQL schema + 21 seeded controls
├── frontend/                   # Next.js 15 App Router
│   └── app/
│       ├── (auth)/            # Login, Register
│       └── (dashboard)/       # Overview, Controls, Evidence,
│                              # Connectors, Reports, Settings
├── reporter/                   # Python PDF report engine
│   ├── cli.py
│   └── templates/             # Jinja2 → PDF
├── infra/                      # Terraform (GCP)
│   ├── main.tf                # Cloud Run, Cloud SQL, IAM
│   └── variables.tf
├── scripts/demo-seed.sh       # Demo data seeder
├── .github/workflows/ci.yml   # CI/CD + Trivy + Gitleaks
├── .env.example               # Environment variables
├── docker-compose.yml         # Full dev stack
├── Dockerfile.api
└── Dockerfile.frontend
```

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | — | Health check |
| `POST` | `/api/v1/auth/register` | — | Register org + admin |
| `POST` | `/api/v1/auth/login` | — | Login → JWT + refresh |
| `GET` | `/api/v1/dashboard` | JWT | Compliance overview |
| `GET` | `/api/v1/scores` | JWT | Scores by framework |
| `GET` | `/api/v1/controls` | JWT | Controls (filter: `?framework=NIS2`) |
| `GET` | `/api/v1/connectors` | JWT | List cloud connectors |
| `POST` | `/api/v1/connectors` | JWT | Add connector |
| `POST` | `/api/v1/connectors/:id/scan` | JWT | Trigger scan |
| `DELETE` | `/api/v1/connectors/:id` | JWT | Remove connector |
| `GET` | `/api/v1/evidence` | JWT | Recent evidence (last 50) |
| `GET` | `/api/v1/evidence/:id` | JWT | Evidence detail |

---

## ☁️ Deployment (GCP)

```bash
cd infra
terraform init
terraform apply -var="project_id=your-gcp-project"
```

Deploys: Cloud Run (API), Cloud SQL (PostgreSQL 16), Artifact Registry, Secret Manager.

CI/CD via GitHub Actions triggers on `main` push: Go lint → test → build, Next.js lint → build → type check, Trivy vulnerability scan, Gitleaks secret scan, deploy to Cloud Run.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend | Go 1.23, Chi Router, JWT |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Reporter | Python 3.11, Jinja2, WeasyPrint |
| Infra | Terraform, GCP Cloud Run + Cloud SQL |
| CI/CD | GitHub Actions, Trivy, Gitleaks |
| Containers | Docker, Docker Compose |

---

## 🔐 Security

- JWT authentication with refresh tokens (HS256)
- RBAC: admin, member, auditor roles
- bcrypt password hashing (cost 10)
- CORS restricted to frontend origin
- Request ID tracing on all API calls
- SAST + Secret Scanning in CI/CD
- Trivy vulnerability scanning (CRITICAL/HIGH)

---

## 📊 Compliance Frameworks

| Framework | Controls | Scope |
|-----------|----------|-------|
| NIS2 | 8 | EU Network & Information Security Directive |
| DORA | 5 | Digital Operational Resilience Act (financial) |
| ISO 27001 | 5 | Information Security Management System |
| ENS | 3 | Esquema Nacional de Seguridad (Spain) |

---

## 👤 Author

**Santiago Durán Ruiz** — Full-stack software engineer specialized in cybersecurity, cloud infrastructure, and compliance automation.

- GitHub: [@duranruizsantiago-lang](https://github.com/duranruizsantiago-lang)
- More projects: [github.com/duranruizsantiago-lang?tab=repositories](https://github.com/duranruizsantiago-lang?tab=repositories)

---

## 📄 License

MIT © 2026 Santiago Durán Ruiz
