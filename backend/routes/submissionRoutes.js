const express = require("express");
const router = express.Router();

const submissionController = require("../controllers/submissionController");

const verifyToken = require("../middleware/verifyToken");
const verifyRole = require("../middleware/verifyRole");
const validate = require("../middleware/validate");
const { createSubmissionSchema, updateSubmissionSchema, reviewSubmissionSchema } = require("../validators/submissionValidator");


// Student Routes
router.post("/", verifyToken, verifyRole("student"), validate(createSubmissionSchema), submissionController.createSubmission);
router.put("/:id", verifyToken, verifyRole("student"), validate(updateSubmissionSchema), submissionController.updateSubmission);
router.get("/my", verifyToken, verifyRole("student"), submissionController.getMySubmissions);

// Teacher Routes
router.get("/", verifyToken, verifyRole("teacher"), submissionController.getAllSubmissions);
router.get("/pending", verifyToken, verifyRole("teacher"), submissionController.getPendingSubmissions);
router.get("/:id/review", verifyToken, verifyRole("teacher"), submissionController.getSubmissionById);
router.put("/:id/review", verifyToken, verifyRole("teacher"), validate(reviewSubmissionSchema), submissionController.reviewSubmission);

// Shared Routes
router.get("/:id", verifyToken, submissionController.getSubmissionById);

module.exports = router;

