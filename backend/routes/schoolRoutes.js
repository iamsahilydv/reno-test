const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const schoolController = require("../controllers/schoolController");

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../schoolImages"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Add a new school
router.post("/", upload.single("image"), schoolController.addSchool);
// Get all schools
router.get("/", schoolController.getSchools);
// Get a single school by ID
router.get("/:id", schoolController.getSchoolById);
// Update a school by ID
router.put("/:id", upload.single("image"), schoolController.updateSchool);
// Delete a school by ID
router.delete("/:id", schoolController.deleteSchool);

module.exports = router;
