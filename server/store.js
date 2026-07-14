const fs = require("fs");
const path = require("path");

// File-based JSON store standing in as the database. Swap readData/writeData
// for real DB calls later (Render Postgres, etc.) without touching routes.
const DATA_FILE = path.join(__dirname, "data.json");

const EMPTY = {
  users: [],         // {id, name, email, passwordHash, role, subRole, phone, createdAt}
  vendors: [],        // {id, ownerId, name, category, description, logoUrl, createdAt}
  products: [],        // {id, vendorId, name, price, available, imageUrl}
  orders: [],          // {id, studentId, studentName, vendorId, items, itemsTotal, deliveryFee, total,
                        //  deliveryLocation, status, riderId, riderName, paymentStatus, paymentReference, createdAt}
  conversations: [],   // {id, participantIds:[], orderId, createdAt}
  messages: [],        // {id, conversationId, senderId, senderName, text, createdAt}
};

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(EMPTY, null, 2));
    return structuredClone(EMPTY);
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    // merge in any new collections for projects upgraded from the old schema
    return { ...structuredClone(EMPTY), ...parsed };
  } catch (e) {
    return structuredClone(EMPTY);
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const uid = (prefix) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

module.exports = { readData, writeData, uid };
