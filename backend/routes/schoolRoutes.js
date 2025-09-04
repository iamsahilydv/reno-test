const express = require("express");
const router = express.Router();
const schoolController = require("../controllers/schoolController");

// Remove multer from routes - let the controller handle it
// Add a new school
router.post("/", schoolController.addSchool);
// Get all schools
router.get("/", schoolController.getSchools);
// Get a single school by ID
router.get("/:id", schoolController.getSchoolById);
// Update a school by ID
router.put("/:id", schoolController.updateSchool);
// Delete a school by ID
router.delete("/:id", schoolController.deleteSchool);

module.exports = router;
