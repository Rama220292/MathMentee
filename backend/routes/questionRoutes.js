const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const verifyRole = require("../middleware/verifyRole");
const { QUESTION_AUTHOR_ROLES } = require("../config/permissions");
const validate = require("../middleware/validate");
const {
  createQuestionSchema,
  updateQuestionSchema,
  questionPublicationSchema,
  questionArchiveSchema,
  questionImageUploadConfirmationSchema,
  questionImageUploadRequestSchema
} = require("../validators/questionValidator");
const questionController = require("../controllers/questionController");
const { objectIdSchema } = require("../validators/commonValidator");

router.post("/", verifyToken, verifyRole(...QUESTION_AUTHOR_ROLES), validate(createQuestionSchema), questionController.createQuestion);
router.put("/:id", verifyToken, verifyRole(...QUESTION_AUTHOR_ROLES), validate(updateQuestionSchema), questionController.updateQuestion);
router.patch(
  "/:id/publication",
  verifyToken,
  verifyRole(...QUESTION_AUTHOR_ROLES),
  validate(questionPublicationSchema),
  questionController.setQuestionPublication
);
router.patch(
  "/:id/archive",
  verifyToken,
  verifyRole(...QUESTION_AUTHOR_ROLES),
  validate(questionArchiveSchema),
  questionController.setQuestionArchive
);
router.get("/", verifyToken, questionController.getQuestions);
router.get("/meta/options", verifyToken, questionController.getQuestionMeta);
router.post(
  "/image-upload-requests",
  verifyToken,
  verifyRole(...QUESTION_AUTHOR_ROLES),
  validate(questionImageUploadRequestSchema),
  questionController.createQuestionImageUploadRequest
);
router.post(
  "/image-upload-confirmations",
  verifyToken,
  verifyRole(...QUESTION_AUTHOR_ROLES),
  validate(questionImageUploadConfirmationSchema),
  questionController.confirmQuestionImageUpload
);
router.post(
  "/:id/extractions",
  verifyToken,
  verifyRole(...QUESTION_AUTHOR_ROLES),
  validate(objectIdSchema),
  questionController.extractQuestionDraft
);
router.get("/:id", verifyToken, validate(objectIdSchema), questionController.getQuestionById);

module.exports = router;
