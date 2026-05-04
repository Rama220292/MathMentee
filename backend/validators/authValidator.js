const Joi = require("joi");

const passwordSchema = Joi.string()
  .min(8)
  .pattern(/[a-z]/, "lowercase letter")
  .pattern(/[A-Z]/, "uppercase letter")
  .pattern(/[0-9]/, "number")
  .pattern(/[^a-zA-Z0-9]/, "special character")
  .required()
  .messages({
    "string.min": "Password must be at least 8 characters long",
    "string.pattern.name":
      "Password must include at least one {#name}",
    "string.empty": "Password is required"
  });

const signupSchema = Joi.object({
  name: Joi.string().min(2).required(),

  email: Joi.string().email().required(),

  password: passwordSchema,

  role: Joi.string().valid("student", "teacher").required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

module.exports = { signupSchema, loginSchema };