const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const { initializeDatabase } = require("./src/database/db");
const authRoutes = require("./src/routes/authRoutes"); // Import auth routes
const { userAuthenticated } = require("./src/middleware/authMiddleware"); // Import the middleware
const categoryRoutes = require("./src/routes/categoryRoutes");
const expenseRoutes = require("./src/routes/expenseRoutes");
const viewPageRoutes = require("./src/routes/viewPageRoutes");

// Initialize app
const app = express();
const port = process.env.PORT || 3000;

// Set up middleware to parse incoming data
app.use(express.json());
app.use(express.static(__dirname));
app.use(express.static("public")); // Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
dotenv.config();

app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Use 'true' if HTTPS is enabled
  })
);

// Initialize the database
initializeDatabase(); // Explicitly call the initialization

// Use routes
app.use("/api/auth", authRoutes); // Use auth routes for registration and login
app.use("/api", categoryRoutes); // Use category routes for adding categories
app.use("/api", expenseRoutes); // Use expense routes for adding expenses
app.use("/api", viewPageRoutes); // Use view page routes for view expenses page functionality

// Protect the dashboard route with userAuthenticated middleware
app.get("/dashboard", userAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html/dashboard.html"));
});

// Serve the registration form
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html/register.html"));
});

// Serve the login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html/login.html"));
});

// Serve the Add Categories page
app.get("/add-categories", userAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html/add-categories.html"));
});

// Serve the Add Expenses page
app.get("/add-expenses", userAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html/add-expenses.html"));
});

// Serve the View Expenses page
app.get("/view-expenses", userAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html/view-expenses.html"));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
