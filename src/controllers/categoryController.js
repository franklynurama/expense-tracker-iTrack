const { pool } = require("../database/db");

// Controller function to add a category
const addCategory = (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required." });
  }

  const query = "INSERT INTO categories (name) VALUES (?)";

  pool.query(query, [name], (err, results) => {
    if (err) {
      console.error("Error adding category:", err);
      return res.status(500).json({ message: "Error adding category." });
    }
    res
      .status(201)
      .json({ message: "Category added successfully.", id: results.insertId });
  });
};

// Controller function to get all categories
const getCategories = (req, res) => {
  const query = "SELECT * FROM categories";

  pool.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching categories:", err);
      return res.status(500).json({ message: "Error fetching categories." });
    }
    res.status(200).json(results);
  });
};

// Controller function to get all categories for a specific user
const getUserCategories = (req, res) => {
  const userId = req.query.userId;

  const query = `
  SELECT c.name, SUM(ue.amount) AS totalAmount
  FROM users_expenses ue
  JOIN categories c ON ue.category_id = c.id
  WHERE ue.user_id = ?
  GROUP BY c.name
  ORDER BY totalAmount DESC
  `;

  pool.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching categories for user:", err);
      return res.status(500).json({ message: "Error fetching categories." });
    }
    res.status(200).json(results);
  });
};

module.exports = { addCategory, getCategories, getUserCategories };
