const express = require("express");
const bcrypt = require("bcryptjs");
const { readData, writeData, uid } = require("../store");
const { signToken, requireAuth } = require("../middleware/auth");

const router = express.Router();

const ROLES = ["user", "vendor", "delivery"];
const SUB_ROLES = ["student", "lecturer", "staff", "other"];

function publicUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

router.post("/signup", async (req, res) => {
  const { name, email, password, role, subRole, phone } = req.body;
  if (!name?.trim() || !email?.trim() || !password || !role) {
    return res.status(400).json({ error: "name, email, password and role are required" });
  }
  if (!ROLES.includes(role)) return res.status(400).json({ error: "invalid role" });
  if (role === "user" && subRole && !SUB_ROLES.includes(subRole)) {
    return res.status(400).json({ error: "invalid sub role" });
  }
  if (password.length < 6) return res.status(400).json({ error: "password must be at least 6 characters" });

  const data = readData();
  const normalizedEmail = email.trim().toLowerCase();
  if (data.users.some((u) => u.email === normalizedEmail)) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: uid("usr"),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role, // "user" | "vendor" | "delivery"
    subRole: role === "user" ? subRole || "student" : null,
    phone: phone?.trim() || "",
    createdAt: Date.now(),
  };
  data.users.push(user);
  writeData(data);

  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password are required" });

  const data = readData();
  const user = data.users.find((u) => u.email === email.trim().toLowerCase());
  if (!user) return res.status(401).json({ error: "Invalid email or password" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: "Invalid email or password" });

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

router.get("/me", requireAuth, (req, res) => {
  const data = readData();
  const user = data.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "user not found" });
  res.json(publicUser(user));
});

module.exports = router;
