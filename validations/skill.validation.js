const Joi = require("joi");

exports.skillValidation = (data) => {
  const schemaSkill = Joi.object({
    skill: Joi.string(),
  });

  return schemaSkill.validate(data, {abortEarly: false});
}