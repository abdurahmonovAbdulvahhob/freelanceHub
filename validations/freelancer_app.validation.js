const Joi = require("joi");

exports.freelancer_appValidation = (data) => {
  const schemaFreelancer_App = Joi.object({
    freelancerId: Joi.number(),
    projectId: Joi.number(),
  });

  return schemaFreelancer_App.validate(data, {abortEarly: false});
}