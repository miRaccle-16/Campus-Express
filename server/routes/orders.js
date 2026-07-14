const express = require("express");
const { readData, writeData, uid } = require("../store");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

const STATUS_ORDER = ["placed", "confirmed", "preparing", "ready_for_pickup", "picked_up", "delivered"];

function getIO(req) {
  return req.app.get("io");
}

router.get("/", requireAuth, (req, res) => {
  const data = readData();
  let orders = data.orders;
  const { role, id } = req.user;

  if (role === "user") orders = orders.filter((o) => o.studentId === id);
  if (role === "delivery") {
    const { status } = req.query;
    if (status) {
      orders = orders.filter((o) => o.status === status);
      if (status !== "ready_for_pickup") orders = orders.filter((o) => o.riderId === id);
    } else {
      orders = orders.filter((o) => o.riderId === id);
    }
  }
  if (role === "vendor") {
    const vendor = data.vendors.find((v) => v.ownerId === id);
    orders = vendor ? orders.filter((o) => o.vendorId === vendor.id) : [];
  }
  orders = [...orders].sort((a, b) => b.createdAt - a.createdAt);
  res.json(orders);
});

router.post("/", requireAuth, requireRole("user"), (req, res) => {
  const { vendorId, items, deliveryLocation } = req.body;
  if (!vendorId || !items?.length || !deliveryLocation) {
    return res.status(400).json({ error: "vendorId, items and deliveryLocation are required" });
  }
  const data = readData();
  const vendor = data.vendors.find((v) => v.id === vendorId);
  if (!vendor) return res.status(404).json({ error: "vendor not found" });

  let itemsTotal = 0;
  const resolvedItems = [];
  for (const { productId, qty } of items) {
    const product = data.products.find((p) => p.id === productId);
    if (!product) return res.status(404).json({ error: "product not found" });
    itemsTotal += product.price * qty;
    resolvedItems.push({ productId, qty });
  }

  const deliveryFee = 400;
  const order = {
    id: uid("ord"),
    studentId: req.user.id,
    studentName: req.user.name,
    vendorId,
    items: resolvedItems,
    itemsTotal,
    deliveryFee,
    total: itemsTotal + deliveryFee,
    deliveryLocation: deliveryLocation.trim(),
    status: "placed",
    riderId: null,
    riderName: null,
    paymentStatus: "unpaid",
    paymentReference: null,
    createdAt: Date.now(),
  };
  data.orders.push(order);

  // Auto-open a chat thread between the student and the vendor for this order
  const conversation = {
    id: uid("conv"),
    participantIds: [req.user.id, vendor.ownerId],
    orderId: order.id,
    createdAt: Date.now(),
  };
  data.conversations.push(conversation);

  writeData(data);
  res.status(201).json(order);
});

router.patch("/:id", requireAuth, (req, res) => {
  const data = readData();
  const order = data.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "order not found" });

  const { role, id } = req.user;
  const vendor = data.vendors.find((v) => v.id === order.vendorId);
  const isOwningVendor = role === "vendor" && vendor?.ownerId === id;
  const isAssignedOrClaimingRider = role === "delivery";
  const isOwningStudent = role === "user" && order.studentId === id;

  const { status, claim } = req.body;

  if (claim && isAssignedOrClaimingRider) {
    if (order.status !== "ready_for_pickup") return res.status(400).json({ error: "order not ready for pickup" });
    order.status = "picked_up";
    order.riderId = id;
    order.riderName = req.user.name;
    const convo = data.conversations.find((c) => c.orderId === order.id);
    if (convo && !convo.participantIds.includes(id)) convo.participantIds.push(id);
  } else if (status) {
    if (status === "delivered" && !(isAssignedOrClaimingRider && order.riderId === id)) {
      return res.status(403).json({ error: "only the assigned rider can mark this delivered" });
    }
    if (["confirmed", "preparing", "ready_for_pickup"].includes(status) && !isOwningVendor) {
      return res.status(403).json({ error: "only the vendor can update this status" });
    }
    if (status === "cancelled" && !(isOwningVendor || isOwningStudent)) {
      return res.status(403).json({ error: "not allowed to cancel this order" });
    }
    if (status !== "cancelled" && !STATUS_ORDER.includes(status)) {
      return res.status(400).json({ error: "invalid status" });
    }
    order.status = status;
  } else {
    return res.status(400).json({ error: "nothing to update" });
  }

  writeData(data);

  const io = getIO(req);
  if (io) io.to(`order:${order.id}`).emit("order_updated", order);

  res.json(order);
});

module.exports = router;
