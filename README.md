# TZ Trade Hub

Marketplace app with mobile money checkout via ClickPesa.

## ⚠️ About credentials

This project never stores real API secrets in code or in `.env.example`.
Secrets are read strictly from environment variables at runtime
(`src/payments/clickpesa.js` has **no hardcoded fallback values** — it
throws a clear error if they're missing). This is deliberate:

- `.env.example` is meant to be committed to git — real secrets in it
  would be exposed to anyone with repo access.
- Hardcoded fallback secrets in source code end up permanently in git
  history and are effectively unrevokable without rotating the key.

**If a real ClickPesa secret was ever pasted into a chat, ticket, or
committed to git, rotate it in the ClickPesa dashboard immediately** —
treat it as compromised.

## Local setup

A local `.env` file has been configured for this working copy and is excluded by `.gitignore`. Do not commit or publish it.

```bash
cp .env.example .env
# edit .env and fill in your real ClickPesa sandbox credentials
npm install
npm run dev
```

Visit http://localhost:3000

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `CLICKPESA_CLIENT_ID` | yes | From your ClickPesa merchant dashboard |
| `CLICKPESA_API_KEY` | yes | From your ClickPesa merchant dashboard |
| `CLICKPESA_BASE_URL` | no | Defaults to ClickPesa's production API base |
| `APP_BASE_URL` | no | Public URL of this app, used for webhook registration |
| `PORT` | no | Defaults to 3000 |

## Deploying to Render

1. Push this repo to GitHub (make sure `.env` is **not** committed —
   `.gitignore` already excludes it).
2. In Render, create a new Web Service from the repo. `render.yaml` in
   this repo pre-fills the build/start commands.
3. In **Render Dashboard → your service → Environment**, add:
   - `CLICKPESA_CLIENT_ID` = *(your real client ID)*
   - `CLICKPESA_API_KEY` = *(your real API secret)*
   These are encrypted at rest by Render and are the correct place for
   production secrets — never in the repo.
4. In your ClickPesa merchant dashboard, register the webhook URL:
   `https://<your-render-domain>/api/checkout/webhook`
5. Deploy. Check the logs on startup — the app will warn clearly if
   the ClickPesa env vars are missing.

## API endpoints

- `POST /api/checkout/preview` — `{ amount, phoneNumber }` → preview
  available mobile money methods/fees
- `POST /api/checkout/initiate` — `{ amount, phoneNumber }` → sends a
  USSD push prompt to the customer's phone
- `GET /api/checkout/status/:orderReference` — poll payment status
- `POST /api/checkout/webhook` — ClickPesa's server-to-server payment
  confirmation callback

## Before going live

- Verify exact ClickPesa endpoint paths/payloads against their current
  official docs (https://docs.clickpesa.com) — mobile money APIs
  change, and `src/payments/clickpesa.js` should be checked against the
  latest spec before processing real transactions.
- Implement webhook signature verification in
  `src/routes/checkout.js` (marked with a `TODO`) before trusting
  webhook payloads.
- Replace the in-memory example flow with real order/payment
  persistence (a database) before production use.
