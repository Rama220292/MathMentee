const express = require("express");
const router = express.Router();

const submissionController = require("../controllers/submissionController");

const verifyToken = require("../middleware/verifyToken");
const verifyRole = require("../middleware/verifyRole");
const validate = require("../middleware/validate");
const {
  createSubmissionSchema,
  reviewSubmissionSchema,
  submissionImageUploadConfirmationSchema,
  submissionImageUploadRequestSchema,
  transcriptSchema,
  updateSubmissionSchema
} = require("../validators/submissionValidator");


// Student Routes
router.post("/", verifyToken, verifyRole("student"), validate(createSubmissionSchema), submissionController.createSubmission);
router.post(
  "/handwriting-upload-requests",
  verifyToken,
  verifyRole("student"),
  validate(submissionImageUploadRequestSchema),
  submissionController.createHandwritingUploadRequest
);
router.post(
  "/handwriting-upload-confirmations",
  verifyToken,
  verifyRole("student"),
  validate(submissionImageUploadConfirmationSchema),
  submissionController.confirmHandwritingUpload
);
router.post(
  "/:id/extractions",
  verifyToken,
  verifyRole("student"),
  submissionController.extractHandwriting
);
router.patch(
  "/:id/transcript",
  verifyToken,
  verifyRole("student"),
  validate(transcriptSchema),
  submissionController.updateTranscript
);
router.post(
  "/:id/confirm",
  verifyToken,
  verifyRole("student"),
  submissionController.confirmTranscriptAndGrade
);
router.put("/:id", verifyToken, verifyRole("student"), validate(updateSubmissionSchema), submissionController.updateSubmission);
router.get("/my", verifyToken, verifyRole("student"), submissionController.getMySubmissions);

// Teacher Routes
router.get("/", verifyToken, verifyRole("teacher", "content_manager"), submissionController.getAllSubmissions);
router.get("/pending", verifyToken, verifyRole("teacher", "content_manager"), submissionController.getPendingSubmissions);
router.get("/:id/review", verifyToken, verifyRole("teacher", "content_manager"), submissionController.getSubmissionById);
router.put("/:id/review", verifyToken, verifyRole("teacher", "content_manager"), validate(reviewSubmissionSchema), submissionController.reviewSubmission);

// Shared Routes
router.get("/:id/source-image", verifyToken, submissionController.getSubmissionImageUrl);
router.get("/:id", verifyToken, submissionController.getSubmissionById);

module.exports = router;
