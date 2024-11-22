const Joi = require("joi");

exports.adminValidation = (data) => {
  const schemaAdmin = Joi.object({
    name: Joi.string(),
    email: Joi.string().email().lowercase(),
    password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{6,30}$")),
    confirm_password: Joi.ref("password"),
    is_active: Joi.boolean().default(false),
    is_creator: Joi.boolean().default(false),
    created_date: Joi.date().default(Date.now),
    updated_date: Joi.date(),
    token: Joi.string(),
    activation_link: Joi.string()
  });

  return schemaAdmin.validate(data, {abortEarly: false});
}