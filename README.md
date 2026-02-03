# SignalCard MVP

AI‑enhanced NFC business card MVP built with Next.js + Supabase‑ready data layer.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and try the demo card: `http://localhost:3000/r/demo`.

## Environment Variables

Create `.env.local` and add what you want to enable:

```
# Supabase (server side)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Resend
RESEND_API_KEY=
RESEND_FROM=

# Zapier / Make
ZAPIER_WEBHOOK_URL=

# OpenAI
OPENAI_API_KEY=

# PostHog (client)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

## Supabase Schema

Run the schema in `supabase/schema.sql` inside your Supabase project.

## Demo Data

If Supabase isn’t configured, the app falls back to `data/dev-store.json` and seed data in `data/seed.ts`.

## Key Routes

- `/r/:slug` — NFC/QR router with contextual profile selection.
- `/api/capture` — lead capture + GDPR opt‑in + follow‑up + Zapier webhook.
- `/api/ai/bio` — AI bio rewrite.
- `/api/webhook/zapier` — direct webhook forward.
- `/app` — basic dashboard preview.

## Notes

This MVP focuses on fast validation. Billing, multi‑tenant white‑label, and SSO are intentionally out of scope.

## Compliance Backend (PPWR + DPP)

### Endpoints

- `POST /api/compliance/products/create`
  - Body: `{ title, description?, length_cm, width_cm, height_cm, source?, external_id? }`
  - Response: `{ product_id }`
- `POST /api/compliance/products/import`
  - Body: `{ csv }` (headers: `title,description,length_cm,width_cm,height_cm,external_id`)
  - Response: `{ imported, product_ids }`
- `POST /api/compliance/report/generate`
  - Body: `{ product_id }`
  - Response: `{ report_id }`
- `POST /api/compliance/report/finalize`
  - Body: `{ report_id }`
  - Response: `{ pdf_url }`
- `GET /api/compliance/report/:id`
  - Response: `ComplianceReport`

### Lifecycle

1. Create a product (manual or CSV import).
2. Generate a draft report with PPWR calculation.
3. Finalize the report to produce PDF + QR (irreversible).
4. Use `/verify/:report_id?hash=...` for public verification.

### Storage

- Bucket: `compliance-assets` (public or configured for `getPublicUrl`)
- Objects:
  - `reports/{report_id}.pdf`
  - `qr/{report_id}.svg`
  - `qr/{report_id}.png`

### Environment Variables

```
APP_DOMAIN=
COMPLIANCE_QR_SECRET=
COMPLIANCE_STORAGE_BUCKET=compliance-assets
```

### Database Schema

Run `supabase/compliance.sql` in your Supabase project to create the required tables.

### PDF + QR Generation

- Finalization creates a deterministic QR payload: `https://APP_DOMAIN/verify/{report_id}?hash=SHA256(report_id + secret)`.
- QR is generated as SVG + PNG (300 DPI metadata) and stored in Supabase Storage.
- A 2-page A4 PDF is generated using `@react-pdf/renderer` and uploaded to Storage.

### New Dependencies

- `@react-pdf/renderer`
- `qrcode`
- `sharp`
- `csv-parse`
- `vitest`
- `@types/qrcode`
