const express = require("express");
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "opensre_test_token_12345";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || "1107090792487620";

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

app.post("/webhook", async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log("Incoming WhatsApp webhook:");
  console.log(JSON.stringify(req.body, null, 2));
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Extract message details
  const text = req.body?.text;
  const phone = req.body?.phone;
  const type = req.body?.type;

  if (text) {
    console.log(`→ Message: ${text.substring(0, 100)}...`);
  }
  if (phone) {
    console.log(`→ Target phone: ${phone}`);
  }
  if (type) {
    console.log(`→ Type: ${type}`);
  }

  // If from OpenSRE, forward to WhatsApp
  if (text && phone && WHATSAPP_TOKEN) {
    try {
      console.log(`[→] Forwarding to WhatsApp...`);
      const response = await fetch(
        `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: phone.replace(/\D/g, ""), // Remove non-digits
            type: "text",
            text: { body: text }
          })
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        console.log(`[✓] WhatsApp message sent successfully`);
        console.log(`    Message ID: ${data?.messages?.[0]?.id}`);
      } else {
        console.error(`[✗] WhatsApp API error:`, data?.error?.message);
      }
    } catch (err) {
      console.error(`[✗] Failed to forward to WhatsApp:`, err.message);
    }
  }

  // Acknowledge receipt
  res.sendStatus(200);
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
