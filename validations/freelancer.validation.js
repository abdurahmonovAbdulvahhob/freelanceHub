const Joi = require("joi");

exports.freelancerValidation = (data) => {
  const schemaFreelancer = Joi.object({
    name: Joi.string(),
    email: Joi.string().email().lowercase(),
    phone_number: Joi.string(),
    experience_year: Joi.number(),
    is_active: Joi.boolean().default(false),
    created_date: Joi.date().default(Date.now),
    updated_date: Joi.date(),
    token: Joi.string(),
    activation_link: Joi.string()
  });

  return schemaFreelancer.validate(data, {abortEarly: false});
}