const { pool } = require("../database/db");

// Controller function to add an expense
const addExpense = (req, res) => {
  const { userId, categoryId, description, amount, date } = req.body;

  if (!categoryId || !description || !amount || !date) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const query = `
    INSERT INTO users_expenses (user_id, category_id, description, amount, date)
    VALUES (?, ?, ?, ?, ?)
  `;

  pool.query(
    query,
    [userId, categoryId, description, amount, date],
    (err, results) => {
      if (err) {
        console.error("Error adding expense:", err);
        return res.status(500).json({ message: "Error adding expense." });
      }
      res
        .status(201)
        .json({ message: "Expense added successfully.", id: results.insertId });
    }
  );
};

// Controller function to get all expenses for a user
const getExpenses = (req, res) => {
  const userId = req.query.userId; // Assuming userId is passed as a query parameter

  const query = "SELECT * FROM users_expenses WHERE user_id = ?";

  pool.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching expenses:", err);
      return res.status(500).json({ message: "Error fetching expenses." });
    }
    res.status(200).json(results);
  });
};

// Controller function to get recent expenses (for dashboard)
const getRecentExpenses = (req, res) => {
  const userId = req.query.userId;

  const query = `
      SELECT users_expenses.id, users_expenses.description, users_expenses.amount, users_expenses.date, categories.name AS category_name
      FROM users_expenses
      JOIN categories ON users_expenses.category_id = categories.id
      WHERE users_expenses.user_id = ?
      ORDER BY users_expenses.date DESC
      LIMIT 6;
    `;

  pool.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching recent expenses:", err);
      return res
        .status(500)
        .json({ message: "Error fetching recent expenses." });
    }
    res.status(200).json(results);
  });
};

// Controller function to get the category with the highest expenses
const getCategoryWithHighestExpenses = (req, res) => {
  const userId = req.query.userId; // Assuming userId is passed as a query parameter

  const query = `
      SELECT c.name, SUM(ue.amount) AS totalAmount
      FROM users_expenses ue
      JOIN categories c ON ue.category_id = c.id
      WHERE ue.user_id = ?
      GROUP BY c.name
      ORDER BY totalAmount DESC
      LIMIT 1
    `;

  pool.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching category with highest expenses:", err);
      return res.status(500).json({ message: "Error fetching data." });
    }
    if (results.length > 0) {
      res.status(200).json(results[0]);
    } else {
      res.status(200).json({ name: "No expenses yet", totalAmount: 0 });
    }
  });
};

// Controller function to get the total amount for expenses
const getTotalExpensesAmount = (req, res) => {
  const userId = req.query.userId;

  const query = `
      SELECT IFNULL(SUM(users_expenses.amount), 0) AS totalAmount
      FROM users_expenses
      WHERE users_expenses.user_id = ?;
    `;

  pool.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching total expenses amount:", err);
      return res
        .status(500)
        .json({ message: "Error fetching total expenses amount." });
    }
    res.status(200).json(results[0]);
  });
};

// Controller function to get all expenses (ordered in ascending order)
const getOrderedExpenses = (req, res) => {
  const userId = req.query.userId;

  const query = `
        SELECT users_expenses.id, users_expenses.description, users_expenses.amount, users_expenses.date, categories.name AS category_name
        FROM users_expenses
        JOIN categories ON users_expenses.category_id = categories.id
        WHERE users_expenses.user_id = ?
        ORDER BY users_expenses.date ASC
        `;

  pool.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching expenses:", err);
      return res.status(500).json({ message: "Error fetching expenses." });
    }
    res.status(200).json(results);
  });
};

module.exports = {
  addExpense,
  getExpenses,
  getRecentExpenses,
  getCategoryWithHighestExpenses,
  getTotalExpensesAmount,
  getOrderedExpenses,
};
