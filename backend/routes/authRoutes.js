const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const validate = require("../middleware/validate");
const { signupSchema, loginSchema } = require("../validators/authValidator");

router.post("/signup",  validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);
router.get("/verify", authController.verifyEmail);

module.exports = router;