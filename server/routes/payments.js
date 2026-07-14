const express = require("express");
const crypto = require("crypto");
const { readData, writeData } = require("../store");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const PAYSTACK_BASE = "https://api.paystack.co";
const APP_URL = process.env.APP_URL || "http://localhost:5173";

function paystackConfigured(res) {
  if (!PAYSTACK_SECRET_KEY) {
    res.status(500).json({
      error: "Payments are not configured yet — set PAYSTACK_SECRET_KEY on the server.",
    });
    return false;
  }
  return true;
}

// Start a payment for an order. Returns a Paystack checkout URL to redirect the student to.
router.post("/initialize", requireAuth, requireRole("user"), async (req, res) => {
  if (!paystackConfigured(res)) return;
  const { orderId } = req.body;
  const data = readData();
  const order = data.orders.find((o) => o.id === orderId && o.studentId === req.user.id);
  if (!order) return res.status(404).json({ error: "order not found" });
  if (order.paymentStatus === "paid") return res.status(400).json({ error: "order already paid" });

  try {
    const resp = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: req.user.email,
        amount: Math.round(order.total * 100), // kobo
        currency: "NGN",
        callback_url: `${APP_URL}/payment/callback`,
        metadata: { orderId: order.id, studentId: req.user.id },
      }),
    });
    const json = await resp.json();
    if (!json.status) return res.status(502).json({ error: json.message || "Could not start payment" });

    order.paymentReference = json.data.reference;
    writeData(data);

    res.json({ authorizationUrl: json.data.authorization_url, reference: json.data.reference });
  } catch (e) {
    res.status(502).json({ error: "Could not reach Paystack" });
  }
});

// Confirm a payment after the student returns from Paystack's checkout.
router.get("/verify/:reference", requireAuth, async (req, res) => {
  if (!paystackConfigured(res)) return;
  const { reference } = req.params;

  try {
    const resp = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });
    const json = await resp.json();
    if (!json.status) return res.status(502).json({ error: "Could not verify payment" });

    const data = readData();
    const order = data.orders.find((o) => o.paymentReference === reference);
    if (!order) return res.status(404).json({ error: "order not found for this reference" });

    if (json.data.status === "success") {
      order.paymentStatus = "paid";
      writeData(data);
      return res.json({ paid: true, order });
    }
    res.json({ paid: false, order });
  } catch (e) {
    res.status(502).json({ error: "Could not reach Paystack" });
  }
});

// Optional: Paystack can call this directly to confirm payment server-to-server.
// Configure this URL in your Paystack dashboard under Settings -> API Keys & Webhooks.
router.post(
  "/webhook",
  express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }),
  async (req, res) => {
    const signature = req.headers["x-paystack-signature"];
    if (PAYSTACK_SECRET_KEY && req.rawBody) {
      const expected = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY).update(req.rawBody).digest("hex");
      if (signature !== expected) return res.sendStatus(401);
    }

    const event = req.body;
    if (event?.event === "charge.success") {
      const reference = event.data?.reference;
      const data = readData();
      const order = data.orders.find((o) => o.paymentReference === reference);
      if (order) {
        order.paymentStatus = "paid";
        writeData(data);
      }
    }
    res.sendStatus(200);
  }
);

module.exports = router;
