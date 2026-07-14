const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const { readData, writeData, uid } = require("./store");
const { JWT_SECRET } = require("./middleware/auth");
const { UPLOAD_DIR } = require("./middleware/upload");

const authRoutes = require("./routes/auth");
const vendorRoutes = require("./routes/vendors");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const paymentRoutes = require("./routes/payments");
const conversationRoutes = require("./routes/conversations");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.set("io", io);

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOAD_DIR));

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/conversations", conversationRoutes);

// ---------------------------------------------------------------
// Real-time chat over Socket.io, authenticated with the same JWT
// used by the REST API.
// ---------------------------------------------------------------
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("unauthorized"));
  try {
    socket.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    next(new Error("unauthorized"));
  }
});

io.on("connection", (socket) => {
  socket.on("join", (conversationId) => {
    const data = readData();
    const convo = data.conversations.find((c) => c.id === conversationId);
    if (convo && convo.participantIds.includes(socket.user.id)) {
      socket.join(conversationId);
      if (convo.orderId) socket.join(`order:${convo.orderId}`);
    }
  });

  socket.on("send_message", ({ conversationId, text }) => {
    if (!text?.trim()) return;
    const data = readData();
    const convo = data.conversations.find((c) => c.id === conversationId);
    if (!convo || !convo.participantIds.includes(socket.user.id)) return;

    const message = {
      id: uid("msg"),
      conversationId,
      senderId: socket.user.id,
      senderName: socket.user.name,
      text: text.trim().slice(0, 2000),
      createdAt: Date.now(),
    };
    data.messages.push(message);
    writeData(data);

    io.to(conversationId).emit("new_message", message);
  });
});

// ---------------------------------------------------------------
// Serve the built React app for every non-API route (client-side routing)
// ---------------------------------------------------------------
const clientDist = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/")) return next();
  res.sendFile(path.join(clientDist, "index.html"));
});

server.listen(PORT, () => {
  console.log(`CampusExpress server running on port ${PORT}`);
});
