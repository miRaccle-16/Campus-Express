const express = require("express");
const { readData, writeData, uid } = require("../store");
const { requireAuth, requireRole } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

const router = express.Router();

router.get("/", (req, res) => {
  const data = readData();
  res.json(data.vendors);
});

router.get("/mine", requireAuth, requireRole("vendor"), (req, res) => {
  const data = readData();
  const vendor = data.vendors.find((v) => v.ownerId === req.user.id) || null;
  res.json(vendor);
});

router.post("/", requireAuth, requireRole("vendor"), upload.single("logo"), (req, res) => {
  const data = readData();
  if (data.vendors.some((v) => v.ownerId === req.user.id)) {
    return res.status(409).json({ error: "You already have a vendor stall" });
  }
  const { name, category, description } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "name is required" });

  const vendor = {
    id: uid("ven"),
    ownerId: req.user.id,
    name: name.trim(),
    category: category || "Other",
    description: (description || "").trim() || "Campus vendor",
    logoUrl: req.file ? `/uploads/${req.file.filename}` : null,
    createdAt: Date.now(),
  };
  data.vendors.push(vendor);
  writeData(data);
  res.status(201).json(vendor);
});

module.exports = router;
