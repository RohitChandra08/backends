const express = require("express");
const path = require("path");
const session = require("express-session");
const connectdb = require("./config/db"); // Import the function
const authRouter = require("./router/auth.router");
const authMiddleware = require("./middleware/auth.middleware");

const app = express();

// Connect to local MongoDB
connectdb(); // Call the function — works without errors now

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SESSION SETUP
app.use(
  session({
    secret: "mySuperSecret123!", // Hardcoded secret, no .env
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
  })
);

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // For file uploads

// Root route
app.get("/", (req, res) => {
  res.send("Backend is running successfully (Local)!");
});

// Page routes
app.get("/signup", (req, res) => res.render("signup"));
app.get("/login", (req, res) => res.render("login"));
app.get("/upload", authMiddleware, (req, res) => res.render("upload"));

// API routes
app.use("/api/user", authRouter);

// Local port
const PORT = 8000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT} (Local MongoDB Compass)`)
);