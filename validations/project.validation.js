const Joi = require("joi");

exports.projectValidation = (data) => {
  const schemaProject = Joi.object({
    clientId: Joi.number(),
    title: Joi.string(),
    description: Joi.string(),
    budget: Joi.number(),
    is_active: Joi.boolean().default(false),
    deadline: Joi.date(),
    status: Joi.string(),
  });

  return schemaProject.validate(data, {abortEarly: false});
}