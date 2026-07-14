const multer = require("multer");
const path = require("path");
const fs = require("fs");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `img_${Date.now()}${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (/^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype)) return cb(null, true);
  cb(new Error("Only image files are allowed"));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = { upload, UPLOAD_DIR };
