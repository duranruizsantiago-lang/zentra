#!/bin/bash
# CertFlow Demo Seed Script
# Populates the platform with sample data so recruiters can see it in action.
# Usage: ./scripts/demo-seed.sh [API_URL]

API_URL="${1:-http://localhost:8080}"
FRONTEND_URL="${2:-http://localhost:3000}"

set -e

echo "========================================"
echo "  CertFlow Demo Seed"
echo "========================================"
echo ""

# 1. Register demo organization
echo "[1/4] Creating demo organization..."
REGISTER=$(curl -s -X POST "$API_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"organization_name":"Acme Cyber S.L.","email":"demo@certflow.io","password":"Demo1234!"}')

TOKEN=$(echo "$REGISTER" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null || echo "")

if [ -z "$TOKEN" ]; then
  # Org might already exist, try login
  LOGIN=$(curl -s -X POST "$API_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"demo@certflow.io","password":"Demo1234!"}')
  TOKEN=$(echo "$LOGIN" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
  echo "  (org already exists, logged in)"
else
  echo "  Created: Acme Cyber S.L."
fi
echo "  Token: ${TOKEN:0:20}..."
echo ""

# 2. Add GCP connector
echo "[2/4] Adding GCP connector..."
CONNECTOR=$(curl -s -X POST "$API_URL/api/v1/connectors" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Produccion GCP","type":"gcp","config":"{\"project_id\":\"acme-production\"}"}')

CONNECTOR_ID=$(echo "$CONNECTOR" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
echo "  Connector ID: $CONNECTOR_ID"
echo ""

# 3. Add AWS connector
echo "[3/4] Adding AWS connector..."
AWS_CONN=$(curl -s -X POST "$API_URL/api/v1/connectors" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Staging AWS","type":"aws","config":"{\"account_id\":\"123456789012\",\"region\":\"eu-west-1\"}"}')

AWS_ID=$(echo "$AWS_CONN" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
echo "  Connector ID: $AWS_ID"
echo ""

# 4. Trigger scans
echo "[4/4] Triggering compliance scans..."
curl -s -X POST "$API_URL/api/v1/connectors/$CONNECTOR_ID/scan" \
  -H "Authorization: Bearer $TOKEN" > /dev/null
echo "  GCP scan triggered"

curl -s -X POST "$API_URL/api/v1/connectors/$AWS_ID/scan" \
  -H "Authorization: Bearer $TOKEN" > /dev/null
echo "  AWS scan triggered"
echo ""

# 5. Show results
echo "========================================"
echo "  Demo Ready!"
echo "========================================"
echo ""
echo "  Frontend:  $FRONTEND_URL/login"
echo "  Email:     demo@certflow.io"
echo "  Password:  Demo1234!"
echo ""
echo "  Dashboard: $FRONTEND_URL/overview"
echo ""

# Show dashboard data
DASHBOARD=$(curl -s "$API_URL/api/v1/dashboard" -H "Authorization: Bearer $TOKEN")
EVIDENCE=$(echo "$DASHBOARD" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  Evidencias: {d[\"total_evidence\"]}')" 2>/dev/null)
SCORES=$(echo "$DASHBOARD" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f'  NIS2: {s[\"score\"]:.0f}%') for s in (d.get('scores') or [])]" 2>/dev/null)

echo "  Quick stats:"
echo "  $EVIDENCE"
echo "  $SCORES"
echo ""
echo "  The platform is seeded with compliance evidence"
echo "  from simulated GCP and AWS scans. Explore:"
echo "    - Controls matrix (NIS2, DORA, ISO 27001, ENS)"
echo "    - Evidence timeline"
echo "    - PDF report generation"
echo ""
