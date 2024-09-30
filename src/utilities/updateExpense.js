const { pool } = require("../database/db");

// Fetch expense details
const fetchExpenses = async (expenseId, userId) => {
  try {
    const query = `
        SELECT users_expenses.id, 
            users_expenses.description, 
            users_expenses.amount, 
            users_expenses.date, 
            categories.name AS category_name,
            categories.id AS category_id
        FROM users_expenses
        JOIN categories ON users_expenses.category_id = categories.id
        WHERE users_expenses.id = ? AND users_expenses.user_id = ?;
        `;
    const [rows] = await pool.promise().query(query, [expenseId, userId]);

    if (rows.length === 0) {
      return { status: 404, error: "Expense not found" };
    }

    return { status: 200, data: rows[0] }; // Send back the expense details
  } catch (err) {
    console.error("Error fetching expense details:", err);
    return { status: 500, error: "Internal Server Error" };
  }
};

// Update an expense
const updateExpense = async (
  expenseId,
  userId,
  categoryId,
  description,
  amount,
  date
) => {
  try {
    const query = `
    UPDATE users_expenses 
    SET category_id = ?, description = ?, amount = ?, date = ? 
    WHERE id = ? AND user_id = ?;
    `;

    await pool
      .promise()
      .query(query, [categoryId, description, amount, date, expenseId, userId]);

    return { status: 200, message: "Expense updated successfully" };
  } catch (err) {
    console.error("Error in updateExpense:", err);
    return { status: 500, error: "Internal Server Error" };
  }
};

module.exports = { fetchExpenses, updateExpense };
