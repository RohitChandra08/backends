const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const bcrypt = require("bcrypt");
const { logoutAdmin } = require("../controller/auth.controller");
const Admin = require("../model/auth.model");
const File = require("../model/file.model"); // MongoDB model for files

// ----------------------
// 🔹 AUTH ROUTES
// ----------------------
router.post("/admin/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: "All fields are required" });

  const isExist = await Admin.findOne({ email });
  if (isExist) return res.status(409).json({ success: false, message: "Email already exists" });

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  await Admin.create({ name, email, password: hashedPassword });

  res.redirect("/upload");
});

router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "All fields are required" });

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ success: false, message: "Email or password wrong" });

    res.redirect("/upload");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/admin/logout", logoutAdmin);

// ----------------------
// 🔹 FILE UPLOAD ROUTES
// ----------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Upload multiple files
router.post("/upload", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0)
    return res.status(400).json({ success: false, message: "No files uploaded" });

  const savedFiles = [];
  for (const file of req.files) {
    const fileDoc = await File.create({
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      path: `/uploads/${file.filename}`,
    });
    savedFiles.push(fileDoc);
  }

  res.json({ success: true, files: savedFiles });
});

// Get all files
router.get("/files", async (req, res) => {
  const files = await File.find().sort({ createdAt: -1 });
  res.json({ success: true, files });
});

// Delete file
router.delete("/files/:id", async (req, res) => {
  const file = await File.findByIdAndDelete(req.params.id);
  if (!file) return res.status(404).json({ success: false, message: "File not found" });

  const fs = require("fs");
  fs.unlink(path.join(__dirname, "../uploads", file.filename), err => {
    if (err) console.log(err);
  });

  const files = await File.find().sort({ createdAt: -1 });
  res.json({ success: true, files });
});

module.exports = router;
