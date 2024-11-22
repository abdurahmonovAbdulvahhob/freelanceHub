const Joi = require("joi");

exports.paymentValidation = (data) => {
  const schemaPayment = Joi.object({
    freelancerAppId: Joi.number(),
    amount: Joi.number(),
    payment_status: Joi.string(),
    payment_date: Joi.date(),
  });

  return schemaPayment.validate(data, { abortEarly: false });
};
