const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  connectionLimit: 10,
});

// Function to initialize the database
const initializeDatabase = () => {
  pool.getConnection((err, connection) => {
    if (err) return console.error("Error connecting to MySQL:", err);

    console.log("Connected to MySQL as id:", connection.threadId);

    connection.query("CREATE DATABASE IF NOT EXISTS itrack", (err) => {
      if (err) {
        console.error("Error creating database:", err);
        connection.release();
        return;
      }

      console.log("Database 'iTrack' checked/created successfully");

      connection.changeUser({ database: "itrack" }, (err) => {
        if (err) {
          console.error("Error changing database:", err);
          connection.release();
          return;
        }

        console.log("Switched to 'iTrack' database");

        // Create Users Table
        const createUsersTable = `
          CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(100) NOT NULL UNIQUE,
            username VARCHAR(50) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL
          )
        `;
        connection.query(createUsersTable, (err) => {
          if (err) console.error("Error creating users table:", err);
          else console.log("Users table checked/created successfully");
        });

        // Create Categories Table
        const createCategoriesTable = `
          CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE
          )
        `;
        connection.query(createCategoriesTable, (err) => {
          if (err) console.error("Error creating categories table:", err);
          else console.log("Categories table checked/created successfully");
        });

        // Create Expenses Table with foreign key to Users and Categories
        const createExpensesTable = `
          CREATE TABLE IF NOT EXISTS users_expenses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            category_id INT NOT NULL,
            description VARCHAR(255),
            amount DECIMAL(10, 2) NOT NULL,
            date DATE NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
              ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (category_id) REFERENCES categories(id)
              ON DELETE CASCADE ON UPDATE CASCADE
          )
        `;
        connection.query(createExpensesTable, (err) => {
          if (err) console.error("Error creating expenses table:", err);
          else console.log("Expenses table checked/created successfully");
        });

        connection.release(); // Release connection after queries
      });
    });
  });
};

// Export both pool and initialization function
module.exports = { pool, initializeDatabase };
