const express = require("express");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const router = express.Router();
const validator = require("validator"); // for email validation

const Admin = require("../model/auth.model");
const File = require("../model/file.model");
const authMiddleware = require("../middleware/auth.middleware");

// --- SIGNUP ---
router.post("/admin/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) return res.send("All fields are required");

    // Validate email format
    if (!validator.isEmail(email)) return res.send("Invalid email format");

    // Validate password length
    if (password.length < 6) return res.send("Password must be at least 6 characters");

    // Check if email already exists
    const exist = await Admin.findOne({ email });
    if (exist) return res.send("Email already exists");

    // Hash password and create user
    const hashed = bcrypt.hashSync(password, 10);
    const admin = await Admin.create({ name, email, password: hashed });

    // Store logged-in user in session
    req.session.adminId = admin._id;
    res.redirect("/upload");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// --- LOGIN ---
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.send("All fields are required");

    // Look up the user by email
    const admin = await Admin.findOne({ email });
    if (!admin) return res.send("Invalid credentials");

    // Compare password
    const match = bcrypt.compareSync(password, admin.password);
    if (!match) return res.send("Invalid credentials");

    // Store logged-in user in session
    req.session.adminId = admin._id;
    res.redirect("/upload");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// --- LOGOUT ---
router.post("/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// --- MULTER FILE UPLOAD ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// --- UPLOAD FILES ---
router.post("/upload", authMiddleware, upload.array("files"), async (req, res) => {
  try {
    const files = [];
    for (const file of req.files) {
      const doc = await File.create({
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: `/uploads/${file.filename}`,
        admin: req.admin._id, // associate file with current user
      });
      files.push(doc);
    }
    res.json({ success: true, files });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- GET FILES (current user only) ---
router.get("/files", authMiddleware, async (req, res) => {
  try {
    const files = await File.find({ admin: req.admin._id }).sort({ createdAt: -1 });
    res.json({ success: true, files });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- DELETE FILE ---
router.delete("/files/:id", authMiddleware, async (req, res) => {
  try {
    const file = await File.findOneAndDelete({ _id: req.params.id, admin: req.admin._id });
    if (!file) return res.status(404).json({ success: false, message: "File not found" });

    const fs = require("fs");
    fs.unlink(path.join(__dirname, "../uploads", file.filename), err => {
      if (err) console.log(err);
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
