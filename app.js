const express = require("express");
const path = require("path");
const connectdb = require("./config/db");
const authRouter = require("./router/auth.router");

const app = express();
connectdb();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Page routes
app.get("/signup", (req, res) => res.render("signup"));
app.get("/login", (req, res) => res.render("login"));
app.get("/upload", (req, res) => res.render("upload"));

// API routes
app.use("/api/user", authRouter);

// Start server
app.listen(8000, () => {
  console.log("Server running on port 8000");
});
