const { errorHandler } = require("../helpers/error_handler");
const Client = require("../models/client");
const Freelancer_App = require("../models/freelancer_app");
const Payment = require("../models/payment");

const { paymentValidation } = require("../validations/payment.validation");

const addPayment = async (req, res) => {
  try {
    const { error, value } = paymentValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }

    const { freelancerAppId, amount, payment_status, payment_date } = value;

    const newPayment = await Payment.create({
      freelancerAppId,
      amount,
      payment_status,
      payment_date,
    });

    res.status(201).send({
      message: "Payment added successfully",
      payment: newPayment,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        {
          model: Freelancer_App,
          required: true,
          attributes: ["projectId", "freelancerId", "application_status"],
        },
      ],
    });
    if (!payments) {
      return res.status(400).send({ message: "No payments found" });
    }
    res.status(200).send(payments);
  } catch (error) {
    errorHandler(res, error);
  }
};

const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id, {
      include: [
        { model: Client, required: true, attributes: ["name", "company_name"] },
      ],
    });
    if (!payment) {
      return res.status(404).send({ message: "Payment not found" });
    }
    res.status(200).send(payment);
  } catch (error) {
    errorHandler(res, error);
  }
};

const updatePaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = paymentValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }
    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).send({ message: "Payment not found" });
    }
    const { freelancerAppId, amount, payment_status, payment_date } = value;

    const updatedPayment = await Payment.update(
      {
        freelancerAppId,
        amount,
        payment_status,
        payment_date,
      },
      {
        where: { id },
        returning: true,
      }
    );
    if (!updatedPayment) {
      return res.status(500).send({
        error: "Internal Server Error",
      });
    }

    res.status(200).send({
      message: "Payment updated successfully",
      payment: updatedPayment[1][0],
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const deletePaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).send({
        error: "Payment not found",
      });
    }
    await payment.destroy();
    return res.status(200).send({
      message: "Payment deleted successfully",
      data: payment,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

module.exports = {
  addPayment,
  getPayments,
  getPaymentById,
  updatePaymentById,
  deletePaymentById,
};
