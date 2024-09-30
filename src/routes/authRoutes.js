const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Registration route
router.post("/register", authController.registerUser);

// Login route
router.post("/login", authController.loginUser);

// Logout route
router.post("/logout", authController.logoutUser);

module.exports = router;
