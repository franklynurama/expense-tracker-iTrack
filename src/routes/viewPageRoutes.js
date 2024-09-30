const express = require("express");
const router = express.Router();
const {
  getOrderedExpensesDesc,
  fetchExpenseController,
  updateExpenseController,
  deleteExpenseController,
} = require("../controllers/viewPageController");

// Route to get all expenses (ordered in descending order)
router.get("/viewPage/allExpensesDesc", getOrderedExpensesDesc);

// Route to get an expense that the user wants to update
router.get("/viewPage/fetchExpense", fetchExpenseController);

// Route to update an expense
router.put("/viewPage/updateExpense", updateExpenseController);

// Route to delete an expense
router.delete("/viewPage/deleteExpense", deleteExpenseController);

module.exports = router;
