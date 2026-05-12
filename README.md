# OpenSRE WhatsApp Bridge

Test webhook endpoint for OpenSRE WhatsApp integration.

## Quick Start

```bash
npm install
npm start
```

Server runs on port 3000 (or `$PORT` env var).

Webhook endpoint: `http://localhost:3000/webhook`

Verify Token: `opensre_test_token_12345`

## Deploy

Push to GitHub, then deploy on Render:

1. Connect repo to Render
2. Build: `npm install`
3. Start: `npm start`
4. Env: `VERIFY_TOKEN=opensre_test_token_12345`

## Test locally with curl

Probe:
```bash
curl http://localhost:3000/webhook \
  -G \
  -d "hub.mode=subscribe" \
  -d "hub.challenge=CHALLENGE_HERE" \
  -d "hub.verify_token=opensre_test_token_12345"
```

Post message:
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"text": "Incident alert", "phone": "+1234567890"}'
```

## For OpenSRE

Use the public URL (after deployment):

```
https://YOUR-APP.onrender.com/webhook
```

in `opensre onboard` → WhatsApp → Bridge Webhook URL
