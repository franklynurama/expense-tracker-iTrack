const express = require("express");
const router = express.Router();
const {
  addExpense,
  getExpenses,
  getRecentExpenses,
  getCategoryWithHighestExpenses,
  getTotalExpensesAmount,
  getOrderedExpenses,
} = require("../controllers/expenseController");

// Route to add a new expense
router.post("/expenses", addExpense);

// Route to get all expenses for a user
router.get("/expenses", getExpenses);

// Route to get recent expenses (for dashboard)
router.get("/expenses/recent", getRecentExpenses);

// Route to get the category with the highest expenses
router.get("/expenses/categoryWithHighestExp", getCategoryWithHighestExpenses);

// Route to get the total amount for expenses
router.get("/expenses/totalExpAmount", getTotalExpensesAmount);

// Route to get all expenses (ordered in ascending order)
router.get("/expenses/allExpenses", getOrderedExpenses);

module.exports = router;
