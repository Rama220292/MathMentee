const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const verifyRole = require("../middleware/verifyRole");
const validate = require("../middleware/validate");
const {
  createQuestionSchema,
  updateQuestionSchema,
  questionImageUploadRequestSchema
} = require("../validators/questionValidator");
const questionController = require("../controllers/questionController");
const { objectIdSchema } = require("../validators/commonValidator");

router.post("/", verifyToken, verifyRole("content_manager"), validate(createQuestionSchema), questionController.createQuestion);
router.put("/:id", verifyToken, verifyRole("content_manager"), validate(updateQuestionSchema), questionController.updateQuestion);
router.delete("/:id", verifyToken, verifyRole("content_manager"), questionController.deleteQuestion);
router.get("/", verifyToken, questionController.getQuestions);
router.get("/meta/options", verifyToken, questionController.getQuestionMeta);
router.post(
  "/image-upload-requests/validate",
  verifyToken,
  verifyRole("content_manager"),
  validate(questionImageUploadRequestSchema),
  questionController.validateQuestionImageUploadRequest
);
router.get("/:id", verifyToken, validate(objectIdSchema), questionController.getQuestionById);

module.exports = router;
