const pool = require("../pool/pool");

const createSchoolsTable = () => {
  const sql = `CREATE TABLE IF NOT EXISTS schools (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    contact BIGINT NOT NULL,
    image TEXT,
    email_id TEXT NOT NULL
  )`;
  pool.query(sql, (err) => {
    if (err) {
      console.error("Error creating schools table:", err);
    } else {
      console.log("Ensured schools table exists");
    }
  });
};

module.exports = { createSchoolsTable };
