const { pool } = require("../database/db");
const bcrypt = require("bcrypt");

// Delete an expense
const deleteExpense = async (expenseId, password, userId) => {
  try {
    // Fetch the user to validate the password
    const userQuery = "SELECT * FROM users WHERE id = ?";
    const [rows] = await pool.promise().query(userQuery, [userId]);

    if (rows.length === 0) {
      return { status: 404, error: "User not found" };
    }

    const user = rows[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return { status: 400, error: "Invalid password" };
    }

    // Fetch the expense to be deleted for logging
    const expenseQuery =
      "SELECT * FROM users_expenses WHERE id = ? AND user_id = ?";
    const [expenseRows] = await pool
      .promise()
      .query(expenseQuery, [expenseId, userId]);

    if (expenseRows.length === 0) {
      return { status: 404, error: "Expense not found" };
    }

    // Log the expense to be deleted
    console.log("Deleting expense:", expenseRows[0]);

    // Proceed to delete the expense
    const deleteQuery =
      "DELETE FROM users_expenses WHERE id = ? AND user_id = ?";
    await pool.promise().query(deleteQuery, [expenseId, userId]);

    return { status: 200, message: "Expense deleted successfully" };
  } catch (err) {
    console.error("Error in deleteExpense:", err);
    return { status: 500, error: "Internal Server Error" };
  }
};

module.exports = { deleteExpense };
