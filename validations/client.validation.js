const Joi = require("joi");

exports.clientValidation = (data) => {
  const schemaClient = Joi.object({
    name: Joi.string(),
    email: Joi.string().email().lowercase(),
    phone_number: Joi.string(),
    company_name: Joi.string(),
    is_active: Joi.boolean().default(false),
    created_date: Joi.date().default(Date.now),
    updated_date: Joi.date(),
    token: Joi.string(),
    activation_link: Joi.string()
  });

  return schemaClient.validate(data, {abortEarly: false});
}