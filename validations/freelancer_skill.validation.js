const Joi = require("joi");

exports.freelancer_skillValidation = (data) => {
  const schemaFreelancerSkill = Joi.object({
    freelancerId: Joi.number(),
    skillId: Joi.number(),
  });

  return schemaFreelancerSkill.validate(data, {abortEarly: false});
}