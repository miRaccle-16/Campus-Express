const express = require("express");
const { readData, writeData, uid } = require("../store");
const { requireAuth, requireRole } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

const router = express.Router();

router.get("/", (req, res) => {
  const data = readData();
  const { vendorId } = req.query;
  const products = vendorId ? data.products.filter((p) => p.vendorId === vendorId) : data.products;
  res.json(products);
});

router.post("/", requireAuth, requireRole("vendor"), upload.single("image"), (req, res) => {
  const data = readData();
  const vendor = data.vendors.find((v) => v.ownerId === req.user.id);
  if (!vendor) return res.status(404).json({ error: "Create your vendor stall first" });

  const { name, price } = req.body;
  if (!name?.trim() || price == null) return res.status(400).json({ error: "name and price are required" });

  const product = {
    id: uid("prod"),
    vendorId: vendor.id,
    name: name.trim(),
    price: Number(price),
    available: true,
    imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
  };
  data.products.push(product);
  writeData(data);
  res.status(201).json(product);
});

router.patch("/:id", requireAuth, requireRole("vendor"), upload.single("image"), (req, res) => {
  const data = readData();
  const vendor = data.vendors.find((v) => v.ownerId === req.user.id);
  const product = data.products.find((p) => p.id === req.params.id);
  if (!product || !vendor || product.vendorId !== vendor.id) {
    return res.status(404).json({ error: "product not found" });
  }
  if (typeof req.body.available !== "undefined") product.available = req.body.available === "true" || req.body.available === true;
  if (req.body.price != null) product.price = Number(req.body.price);
  if (req.file) product.imageUrl = `/uploads/${req.file.filename}`;
  writeData(data);
  res.json(product);
});

module.exports = router;
