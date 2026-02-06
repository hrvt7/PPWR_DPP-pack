# CompliPack — PPWR + DPP Compliance Backend

Next.js (App Router) backend for PPWR compliance, Digital Product Passports, and
verification workflows with PDF + QR assets. Backend-only.

## Quick Start

```bash
npm install
npm run dev
```

## Core API Endpoints

- `POST /api/compliance/report/generate` → create draft report
- `POST /api/compliance/report/finalize` → finalize report (PDF + QR)
- `GET /api/compliance/report/:id` → fetch report JSON (optional signed URLs)
- `POST /api/compliance/products/create` → create product
- `POST /api/compliance/products/import` → CSV import
- `POST /api/compliance/products/estimate` → AI dimension estimate
- `POST /api/compliance/products/confirm` → confirm packaging dimensions
- `POST /api/integrations/shopify/webhook/order-created` → Shopify order webhook
- `POST /api/v1/generate-dpp` → universal DPP generation (API key)
- `POST /api/epr/export` → quarterly EPR export (XLSX + PDF)

## Environment Variables

```
# Supabase (server side)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI (AI dimension estimate)
OPENAI_API_KEY=

# QR payload + storage
APP_DOMAIN=
COMPLIANCE_QR_SECRET=
COMPLIANCE_STORAGE_BUCKET=compliance-assets

# Shopify
SHOPIFY_WEBHOOK_SECRET=
SHOPIFY_ACCESS_TOKEN=
SHOPIFY_SHOP_DOMAIN=

# Universal API
# stores in shops.public_api_key
```

## Supabase Schema

Apply the SQL in:
`supabase/compliance.sql`

## Notes

- Reports finalize deterministically and generate assets once.
- Verification page uses API fetch only (build-safe).
- Carbon footprint uses a light estimation method and default distance.
