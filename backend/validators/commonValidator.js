const Joi = require("joi");

const objectIdSchema = Joi.object({
  id: Joi.string().length(24).hex().required()
});

module.exports = { objectIdSchema };