const pool = require("../pool/pool");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create the directory if it doesn't exist
    const dir = "schoolImages";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "school-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Initialize multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate contact number
const isValidContact = (contact) => {
  const contactRegex = /^[0-9]{10,}$/;
  return contactRegex.test(contact);
};

// Helper function to delete image file
const deleteImageFile = (filename) => {
  if (filename) {
    const filePath = path.join("schoolImages", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

// Add a new school
exports.addSchool = [
  upload.single("image"),
  (req, res) => {
    try {
      const { name, address, city, state, contact, email_id } = req.body;
      const image = req.file ? req.file.filename : null; // ✅ only filename

      if (!name || !address || !city || !state || !contact || !email_id) {
        deleteImageFile(image);
        return res
          .status(400)
          .json({ error: "All fields except image are required." });
      }

      if (!isValidEmail(email_id)) {
        deleteImageFile(image);
        return res.status(400).json({ error: "Invalid email." });
      }

      if (!isValidContact(contact)) {
        deleteImageFile(image);
        return res.status(400).json({ error: "Invalid contact number." });
      }

      pool.query(
        "INSERT INTO schools (name, address, city, state, contact, image, email_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [name, address, city, state, contact, image, email_id],
        (err, result) => {
          if (err) {
            deleteImageFile(image);
            return res
              .status(500)
              .json({ error: "Database insert error", details: err.message });
          }
          res.status(201).json({
            message: "School added successfully",
            id: result.insertId,
            image: image ? `/schoolImages/${image}` : null,
          });
        }
      );
    } catch (error) {
      deleteImageFile(req.file?.filename);
      res.status(500).json({ error: "Server error", details: error.message });
    }
  },
];

// Get all schools
exports.getSchools = (req, res) => {
  pool.query(
    "SELECT id, name, address, city, state, contact, email_id, image FROM schools",
    (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Database fetch error", details: err.message });
      }
      const schools = results.map((school) => ({
        ...school,
        image: school.image ? `/schoolImages/${school.image}` : null,
      }));
      res.json(schools);
    }
  );
};

// Get a single school by ID
exports.getSchoolById = (req, res) => {
  const { id } = req.params;
  pool.query("SELECT * FROM schools WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Database fetch error", details: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "School not found" });
    }
    const school = results[0];
    school.image = school.image ? `/schoolImages/${school.image}` : null;
    res.json(school);
  });
};

// Update a school by ID
exports.updateSchool = [
  upload.single("image"),
  (req, res) => {
    try {
      const { id } = req.params;
      const { name, address, city, state, contact, email_id } = req.body;
      const newImage = req.file ? req.file.filename : null;

      // First, get the current school data to handle image deletion if needed
      pool.query(
        "SELECT image FROM schools WHERE id = ?",
        [id],
        (err, results) => {
          if (err) {
            deleteImageFile(newImage);
            return res
              .status(500)
              .json({ error: "Database fetch error", details: err.message });
          }

          if (results.length === 0) {
            deleteImageFile(newImage);
            return res.status(404).json({ error: "School not found" });
          }

          const oldImage = results[0].image;

          // Validation
          if (!name || !address || !city || !state || !contact || !email_id) {
            deleteImageFile(newImage);
            return res.status(400).json({ error: "All fields are required." });
          }

          if (!isValidEmail(email_id)) {
            deleteImageFile(newImage);
            return res
              .status(400)
              .json({ error: "Please provide a valid email address." });
          }

          if (!isValidContact(contact)) {
            deleteImageFile(newImage);
            return res.status(400).json({
              error:
                "Please provide a valid contact number (at least 10 digits).",
            });
          }

          let sql =
            "UPDATE schools SET name=?, address=?, city=?, state=?, contact=?, email_id=?";
          const params = [name, address, city, state, contact, email_id];

          if (newImage) {
            sql += ", image=?";
            params.push(newImage);
          }

          sql += " WHERE id=?";
          params.push(id);

          pool.query(sql, params, (err, result) => {
            if (err) {
              deleteImageFile(newImage);
              return res
                .status(500)
                .json({ error: "Database update error", details: err.message });
            }

            // Delete old image if a new image was uploaded
            if (newImage && oldImage) {
              deleteImageFile(oldImage);
            }

            res.json({
              message: "School updated successfully",
              image: newImage ? `/schoolImages/${newImage}` : null,
            });
          });
        }
      );
    } catch (error) {
      deleteImageFile(req.file?.filename);
      res.status(500).json({ error: "Server error", details: error.message });
    }
  },
];

// Delete a school by ID
exports.deleteSchool = (req, res) => {
  const { id } = req.params;

  // First, get the school data to delete the associated image
  pool.query("SELECT image FROM schools WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Database fetch error", details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "School not found" });
    }

    const image = results[0].image;

    // Delete the school record
    pool.query("DELETE FROM schools WHERE id = ?", [id], (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Database delete error", details: err.message });
      }

      // Delete the associated image file
      if (image) {
        deleteImageFile(image);
      }

      res.json({ message: "School deleted successfully" });
    });
  });
};
