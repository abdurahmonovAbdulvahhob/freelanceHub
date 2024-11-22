const { errorHandler } = require("../helpers/error_handler");

const Freelancer_App = require("../models/freelancer_app");

const {
  freelancer_appValidation,
} = require("../validations/freelancer_app.validation");
const Freelancer = require("../models/freelancer");
const Skill = require("../models/skill");
const Payment = require("../models/payment");
const Project = require("../models/project");
const Client = require("../models/client");

const addFreelancer_App = async (req, res) => {
  try {
    const { error, value } = freelancer_appValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }

    const { projectId, freelancerId, application_status } = value;

    const newFreelancer_App = await Freelancer_App.create({
      projectId,
      freelancerId,
      application_status,
    });

    console.log(newFreelancer_App);

    res.status(201).send({
      message: "Freelancer_App added successfully",
      freelancer_app: newFreelancer_App,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getFreelancer_Apps = async (req, res) => {
  try {
    const freelancer_apps = await Freelancer_App.findAll({
      include: [
        {
          model: Payment,
          required: true,
          attributes: ["amount", "payment_status", "payment_date"],
        },
        { model: Freelancer, required: true, attributes: ["name"] },
        { model: Project, required: true}
      ],
    });
    if (!freelancer_apps) {
      return res.status(400).send({ message: "No freelancer_apps found" });
    }
    
    res.status(200).send(freelancer_apps);
  } catch (error) {
    errorHandler(res, error);
  }
};

const getFreelancer_AppById = async (req, res) => {
  try {
    const { id } = req.params;
    const freelancer_app = await Freelancer_App.findByPk(id, {
      include: [
        {
          model: Payment,
          attributes: ["amount", "payment_status", "payment_date"],
        },
        { model: Freelancer, required: true, attributes: ["name"] },
        { model: Project },
      ],
    });
    if (!freelancer_app) {
      return res.status(404).send({ message: "Freelancer_App not found" });
    }
    res.status(200).send(freelancer_app);
  } catch (error) {
    errorHandler(res, error);
  }
};

const updateFreelancer_AppById = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = freelancer_appValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }
    const freelancer_app = await Freelancer_App.findByPk(id);
    if (!freelancer_app) {
      return res.status(404).send({ message: "Freelancer_App not found" });
    }
    const { projectId, freelancerId, application_status } = value;

    const updatedFreelancer_App = await Freelancer_App.update(
      {
        projectId,
        freelancerId,
        application_status,
      },
      {
        where: { id },
        returning: true,
      }
    );
    if (!updatedFreelancer_App) {
      return res.status(500).send({
        error: "Internal Server Error",
      });
    }

    res.status(200).send({
      message: "Freelancer_App updated successfully",
      freelancer_app: updatedFreelancer_App[1][0],
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const deleteFreelancer_AppById = async (req, res) => {
  try {
    const { id } = req.params;
    const freelancer_app = await Freelancer_App.findByPk(id);
    if (!freelancer_app) {
      return res.status(404).send({
        error: "Freelancer_App not found",
      });
    }
    await freelancer_app.destroy();
    return res.status(200).send({
      message: "Freelancer_App deleted successfully",
      data: freelancer_app,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

module.exports = {
  addFreelancer_App,
  getFreelancer_Apps,
  getFreelancer_AppById,
  updateFreelancer_AppById,
  deleteFreelancer_AppById,
};
