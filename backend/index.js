require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const path = require("path");
const cors = require("cors");

// Import pool from pool/pool.js
const pool = require("./pool/pool");

// Import and run schema creation
const { createSchoolsTable } = require("./schema/schools");
createSchoolsTable();

// Test pool connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("MySQL pool connection error:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL database (pool)");
  connection.release();
});

app.use(express.json());
app.use(cors());

// Use school routes
const schoolRoutes = require("./routes/schoolRoutes");
app.use("/api/schools", schoolRoutes);
app.use("/schoolImages", express.static(path.join(__dirname, "schoolImages")));

// Sample route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
