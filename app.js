const express = require("express");
const path = require("path");
const session = require("express-session");
const connectdb = require("./config/db");
const authRouter = require("./router/auth.router");
const authMiddleware = require("./middleware/auth.middleware");

const app = express();
connectdb();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- SESSION SETUP ---
app.use(
  session({
    secret: "your_secret_key", // CHANGE THIS in production
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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/",(req,res)=>{
    res.send("Backend is running successfully on render !")
})

// Page routes
app.get("/signup", (req, res) => res.render("signup"));
app.get("/login", (req, res) => res.render("login"));
app.get("/upload", authMiddleware, (req, res) => res.render("upload"));

// API routes
app.use("/api/user", authRouter);

// Start server
const PORT = 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
