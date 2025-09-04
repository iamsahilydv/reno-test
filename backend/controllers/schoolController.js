const { v2: cloudinary } = require("cloudinary");
const pool = require("../pool/pool");
const multer = require("multer");
const streamifier = require("streamifier"); // npm install streamifier

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dlbzljjem",
  api_key: "539116141828841",
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage (no local file saving)
const storage = multer.memoryStorage();

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

// Helper function to upload image to Cloudinary
const uploadToCloudinary = (fileBuffer, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "school_images", // Organize images in a folder
        public_id: `school_${Date.now()}_${Math.round(Math.random() * 1e9)}`,
        resource_type: "image",
        transformation: [
          { width: 800, height: 600, crop: "limit" }, // Resize large images
          { quality: "auto", fetch_format: "auto" }, // Optimize quality and format
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// Helper function to delete image from Cloudinary
const deleteFromCloudinary = (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Add a new school
exports.addSchool = [
  upload.single("image"),
  async (req, res) => {
    try {
      console.log("Request body:", req.body);
      console.log("Request file:", req.file);

      if (!req.body) {
        return res.status(400).json({
          error: "Request body is missing",
          details: "Make sure you're sending multipart/form-data",
        });
      }

      const { name, address, city, state, contact, email_id } = req.body;

      // Validate required fields
      const missingFields = [];
      if (!name) missingFields.push("name");
      if (!address) missingFields.push("address");
      if (!city) missingFields.push("city");
      if (!state) missingFields.push("state");
      if (!contact) missingFields.push("contact");
      if (!email_id) missingFields.push("email_id");

      if (missingFields.length > 0) {
        return res.status(400).json({
          error: `Missing required fields: ${missingFields.join(", ")}`,
          receivedFields: Object.keys(req.body),
        });
      }

      if (!isValidEmail(email_id)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      if (!isValidContact(contact)) {
        return res.status(400).json({
          error: "Invalid contact number. Must be at least 10 digits",
        });
      }

      let imageUrl = null;
      let imagePublicId = null;

      // Upload image to Cloudinary if provided
      if (req.file) {
        try {
          const uploadResult = await uploadToCloudinary(
            req.file.buffer,
            req.file.originalname
          );
          imageUrl = uploadResult.secure_url;
          imagePublicId = uploadResult.public_id;
          console.log("Image uploaded to Cloudinary:", imageUrl);
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          return res.status(500).json({
            error: "Image upload failed",
            details: uploadError.message,
          });
        }
      }

      // Insert school data into database
      pool.query(
        "INSERT INTO schools (name, address, city, state, contact, image, email_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          name,
          address,
          city,
          state,
          contact,
          imageUrl,
          email_id,
        ],
        (err, result) => {
          if (err) {
            console.error("Database error:", err);
            // If database insert fails and image was uploaded, delete it from Cloudinary
            if (imagePublicId) {
              deleteFromCloudinary(imagePublicId).catch(console.error);
            }
            return res.status(500).json({
              error: "Database insert error",
              details: err.message,
            });
          }
          res.status(201).json({
            message: "School added successfully",
            id: result.insertId,
            image: imageUrl,
          });
        }
      );
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({
        error: "Server error",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
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
      res.json(results);
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
    res.json(results[0]);
  });
};

// Update a school by ID
exports.updateSchool = [
  upload.single("image"),
  async (req, res) => {
    console.log("hie")
    try {
      const { id } = req.params;

      if (!req.body) {
        return res.status(400).json({
          error: "Request body is missing",
          details: "Make sure you're sending multipart/form-data",
        });
      }

      const { name, address, city, state, contact, email_id } = req.body;

      // First, get the current school data
      pool.query(
        "SELECT image FROM schools WHERE id = ?",
        [id],
        async (err, results) => {
          if (err) {
            return res
              .status(500)
              .json({ error: "Database fetch error", details: err.message });
          }

          if (results.length === 0) {
            return res.status(404).json({ error: "School not found" });
          }

          const currentSchool = results[0];
          const oldImagePublicId = currentSchool.image;

          // Validation
          if (!name || !address || !city || !state || !contact || !email_id) {
            return res.status(400).json({ error: "All fields are required." });
          }

          if (!isValidEmail(email_id)) {
            return res
              .status(400)
              .json({ error: "Please provide a valid email address." });
          }

          if (!isValidContact(contact)) {
            return res.status(400).json({
              error:
                "Please provide a valid contact number (at least 10 digits).",
            });
          }

          let imageUrl = currentSchool.image;
          let imagePublicId = currentSchool.image;

          // Upload new image to Cloudinary if provided
          if (req.file) {
            try {
              const uploadResult = await uploadToCloudinary(
                req.file.buffer,
                req.file.originalname
              );
              imageUrl = uploadResult.secure_url;
              imagePublicId = uploadResult.public_id;
              console.log("New image uploaded to Cloudinary:", imageUrl);
            } catch (uploadError) {
              console.error("Cloudinary upload error:", uploadError);
              return res.status(500).json({
                error: "Image upload failed",
                details: uploadError.message,
              });
            }
          }

          // Update school data in database
          pool.query(
            "UPDATE schools SET name=?, address=?, city=?, state=?, contact=?, email_id=?, image=?, image=? WHERE id=?",
            [
              name,
              address,
              city,
              state,
              contact,
              email_id,
              imageUrl,
              imagePublicId,
              id,
            ],
            async (err, result) => {
              if (err) {
                // If database update fails and new image was uploaded, delete it
                if (req.file && imagePublicId !== oldImagePublicId) {
                  await deleteFromCloudinary(imagePublicId).catch(
                    console.error
                  );
                }
                return res.status(500).json({
                  error: "Database update error",
                  details: err.message,
                });
              }

              // Delete old image from Cloudinary if a new image was uploaded
              if (
                req.file &&
                oldImagePublicId &&
                oldImagePublicId !== imagePublicId
              ) {
                await deleteFromCloudinary(oldImagePublicId).catch(
                  console.error
                );
              }

              res.json({
                message: "School updated successfully",
                image: imageUrl,
              });
            }
          );
        }
      );
    } catch (error) {
      res.status(500).json({ error: "Server error", details: error.message });
    }
  },
];

// Delete a school by ID
exports.deleteSchool = (req, res) => {
  const { id } = req.params;

  // First, get the school data to delete the associated image
  pool.query(
    "SELECT image FROM schools WHERE id = ?",
    [id],
    async (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Database fetch error", details: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "School not found" });
      }

      const imagePublicId = results[0].image;

      // Delete the school record
      pool.query(
        "DELETE FROM schools WHERE id = ?",
        [id],
        async (err, result) => {
          if (err) {
            return res
              .status(500)
              .json({ error: "Database delete error", details: err.message });
          }

          // Delete the associated image from Cloudinary
          if (imagePublicId) {
            try {
              await deleteFromCloudinary(imagePublicId);
              console.log("Image deleted from Cloudinary:", imagePublicId);
            } catch (deleteError) {
              console.error("Cloudinary delete error:", deleteError);
              // Don't fail the request if image deletion fails
            }
          }

          res.json({ message: "School deleted successfully" });
        }
      );
    }
  );
};
