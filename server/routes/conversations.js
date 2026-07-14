const express = require("express");
const { readData, writeData, uid } = require("../store");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function withMeta(conversation, data, myId) {
  const otherId = conversation.participantIds.find((id) => id !== myId);
  const other = data.users.find((u) => u.id === otherId);
  const msgs = data.messages
    .filter((m) => m.conversationId === conversation.id)
    .sort((a, b) => a.createdAt - b.createdAt);
  const order = conversation.orderId ? data.orders.find((o) => o.id === conversation.orderId) : null;
  return {
    ...conversation,
    otherUser: other ? { id: other.id, name: other.name, role: other.role } : null,
    lastMessage: msgs[msgs.length - 1] || null,
    orderLabel: order ? `Order · ${order.deliveryLocation}` : null,
  };
}

// All conversations the signed-in user is part of, newest activity first.
router.get("/", requireAuth, (req, res) => {
  const data = readData();
  const mine = data.conversations
    .filter((c) => c.participantIds.includes(req.user.id))
    .map((c) => withMeta(c, data, req.user.id))
    .sort((a, b) => (b.lastMessage?.createdAt || b.createdAt) - (a.lastMessage?.createdAt || a.createdAt));
  res.json(mine);
});

// Start (or reuse) a direct conversation with another user, outside of an order context.
router.post("/", requireAuth, (req, res) => {
  const { otherUserId } = req.body;
  if (!otherUserId) return res.status(400).json({ error: "otherUserId is required" });
  const data = readData();
  let convo = data.conversations.find(
    (c) => !c.orderId && c.participantIds.includes(req.user.id) && c.participantIds.includes(otherUserId)
  );
  if (!convo) {
    convo = { id: uid("conv"), participantIds: [req.user.id, otherUserId], orderId: null, createdAt: Date.now() };
    data.conversations.push(convo);
    writeData(data);
  }
  res.status(201).json(withMeta(convo, data, req.user.id));
});

router.get("/:id/messages", requireAuth, (req, res) => {
  const data = readData();
  const convo = data.conversations.find((c) => c.id === req.params.id);
  if (!convo || !convo.participantIds.includes(req.user.id)) {
    return res.status(404).json({ error: "conversation not found" });
  }
  const msgs = data.messages
    .filter((m) => m.conversationId === convo.id)
    .sort((a, b) => a.createdAt - b.createdAt);
  res.json(msgs);
});

module.exports = router;
