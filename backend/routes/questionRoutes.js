const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const verifyRole = require("../middleware/verifyRole");
const validate = require("../middleware/validate");
const { createQuestionSchema, updateQuestionSchema } = require("../validators/questionValidator");
const questionController = require("../controllers/questionController");
const { objectIdSchema } = require("../validators/commonValidator");

router.post("/", verifyToken, verifyRole("teacher"), validate(createQuestionSchema), questionController.createQuestion);
router.put("/:id", verifyToken, verifyRole("teacher"), validate(updateQuestionSchema), questionController.updateQuestion);
router.delete("/:id", verifyToken, verifyRole("teacher"), questionController.deleteQuestion);
router.get("/", verifyToken, questionController.getQuestions);
router.get("/:id", verifyToken, validate(objectIdSchema), questionController.getQuestionById);
router.get("/meta/options", verifyToken, questionController.getQuestionMeta);

module.exports = router;