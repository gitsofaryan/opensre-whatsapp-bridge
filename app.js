const express = require("express");
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "opensre_test_token_12345";

// Verification endpoint for Meta/WhatsApp
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[✓] Webhook verified with Meta");
    return res.status(200).send(challenge);
  }

  console.log("[✗] Verification failed: invalid token");
  return res.sendStatus(403);
});

// Receive incoming WhatsApp messages/events from Meta
app.post("/webhook", (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log("Incoming WhatsApp webhook from OpenSRE:");
  console.log(JSON.stringify(req.body, null, 2));
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Extract message details for logging
  try {
    const text = req.body?.text;
    const phone = req.body?.phone;
    const type = req.body?.type;

    if (text) {
      console.log(`→ Message text: ${text}`);
    }
    if (phone) {
      console.log(`→ Target phone: ${phone}`);
    }
    if (type) {
      console.log(`→ Type: ${type}`);
    }
  } catch (e) {
    // Ignore parsing errors
  }

  // Acknowledge receipt immediately
  res.sendStatus(200);

  // TODO: Here you would:
  // - Forward to WhatsApp Business API
  // - Send via Twilio
  // - Use a webhook proxy service
  // - Log to file/database
  console.log("[✓] Webhook acknowledged\n");
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).send("OpenSRE WhatsApp Bridge - OK");
});

app.listen(PORT, () => {
  console.log(`\n${"━".repeat(50)}`);
  console.log(`[✓] OpenSRE WhatsApp Bridge listening on port ${PORT}`);
  console.log(`[✓] Verify Token: ${VERIFY_TOKEN}`);
  console.log(`[✓] Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`[✓] Health check: http://localhost:${PORT}/health`);
  console.log(`${"━".repeat(50)}\n`);
});
