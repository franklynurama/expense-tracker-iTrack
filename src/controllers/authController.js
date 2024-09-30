const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");
const { pool } = require("../database/db"); // Import pool

// User registration
exports.registerUser = [
  check("email").isEmail(),
  check("username")
    .matches(/^[A-Za-z][A-Za-z0-9]*$/)
    .withMessage("Username must start with a letter and be alphanumeric"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  check("email").custom(async (value) => {
    const userQuery = "SELECT * FROM users WHERE email = ?";
    const [rows] = await pool.promise().query(userQuery, [value]); // pool.promise() for async/await
    if (rows.length > 0) {
      throw new Error("Email already exists");
    }
  }),
  check("username").custom(async (value) => {
    const userQuery = "SELECT * FROM users WHERE username = ?";
    const [rows] = await pool.promise().query(userQuery, [value]); // pool.promise() for async/await
    if (rows.length > 0) {
      throw new Error("Username already exists");
    }
  }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(req.body.password, salt);

      const newUserQuery =
        "INSERT INTO users(email, username, password) VALUES (?, ?, ?)";
      const values = [req.body.email, req.body.username, hashedPassword];

      // Await the query execution
      await pool.promise().query(newUserQuery, values); // pool.promise() for async/await
      res.status(200).json("User created successfully!");
    } catch (err) {
      console.error(err); // Log the error for more context
      res.status(500).json("Internal Server Error");
    }
  },
];

// User login
exports.loginUser = async (req, res) => {
  try {
    const userQuery = "SELECT * FROM users WHERE email = ?";

    // Use pool.promise() to run the query
    const [data] = await pool.promise().query(userQuery, [req.body.email]);

    if (data.length === 0) {
      return res.status(404).json({ error: "User not found!" });
    }

    const user = data[0];
    const isPasswordValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    req.session.user = user;
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
      }
    });

    res.status(200).json({ message: "Login successful", userId: user.id });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// User logout
exports.logoutUser = (req, res) => {
  console.log("Logging you out!");
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Could not log out.");
    }
    res.clearCookie("connect.sid"); // Clear the session cookie
    res.send("Logged out");
  });
};
