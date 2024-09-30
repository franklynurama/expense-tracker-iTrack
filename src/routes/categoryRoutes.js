const express = require("express");
const router = express.Router();
const {
  addCategory,
  getCategories,
  getUserCategories,
} = require("../controllers/categoryController");

// Route to add a new category
router.post("/categories", addCategory);

// Route to get all categories
router.get("/categories", getCategories);

// Route to get all categories for a specific user
router.get("/categories/userCategories", getUserCategories);

module.exports = router;
