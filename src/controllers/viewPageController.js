const { pool } = require("../database/db");
const { fetchExpenses } = require("..//utilities/updateExpense");
const { updateExpense } = require("..//utilities/updateExpense");
const { deleteExpense } = require("..//utilities/deleteExpense");

// Controller function to get all expenses (ordered in descending order)
const getOrderedExpensesDesc = (req, res) => {
  const userId = req.query.userId;

  const query = `
          SELECT users_expenses.id, 
                users_expenses.description, 
                users_expenses.amount, 
                users_expenses.date, 
                categories.name AS category_name
          FROM users_expenses
          JOIN categories ON users_expenses.category_id = categories.id
          WHERE users_expenses.user_id = ?
          ORDER BY users_expenses.date DESC
          `;

  pool.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching expenses:", err);
      return res.status(500).json({ message: "Error fetching expenses." });
    }
    res.status(200).json(results);
  });
};

// Controller function to fetch an expense that the user wants to update
const fetchExpenseController = async (req, res) => {
  const expenseId = req.query.expenseId;
  const userId = req.session.user.id; // Assuming user session management

  const result = await fetchExpenses(expenseId, userId);

  if (result.status === 200) {
    return res.status(200).json(result.data);
  } else {
    return res.status(result.status).json({ error: result.error });
  }
};

// Controller function to update an expense
const updateExpenseController = async (req, res) => {
  const expenseId = req.query.expenseId;
  const { categoryId, description, amount, date } = req.body;
  const userId = req.session.user.id;

  const result = await updateExpense(
    expenseId,
    userId,
    categoryId,
    description,
    amount,
    date
  );

  if (result.status === 200) {
    return res.status(200).json(result.message);
  } else {
    return res.status(result.status).json({ error: result.error });
  }
};

// Controller function to delete an expense
const deleteExpenseController = async (req, res) => {
  const expenseId = req.query.expenseId;
  const { password } = req.body;
  const userId = req.session.user.id;

  const result = await deleteExpense(expenseId, password, userId);

  if (result.status === 200) {
    return res.status(200).json(result.message);
  } else {
    return res.status(result.status).json({ error: result.error });
  }
};

module.exports = {
  getOrderedExpensesDesc,
  fetchExpenseController,
  updateExpenseController,
  deleteExpenseController,
};
