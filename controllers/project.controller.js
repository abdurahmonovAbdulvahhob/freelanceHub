const { required } = require("joi");
const { errorHandler } = require("../helpers/error_handler");
const Client = require("../models/client");
const Project = require("../models/project");

const { projectValidation } = require("../validations/project.validation");

const addProject = async (req, res) => {
  try {
    const { error, value } = projectValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }

    const { clientId, title, description, budget, deadline, status } = value;


    const newProject = await Project.create({
      clientId,
      title,
      description,
      budget,
      deadline,
      status
    });


    res.status(201).send({
      message: "Project added successfully",
      project: newProject
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        {model: Client, required: true, attributes: ['name','company_name']}
      ],
    });
    if (!projects) {
      return res.status(400).send({ message: "No projects found" });
    }
    res.status(200).send(projects);
  } catch (error) {
    errorHandler(res, error);
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id, {
      include: [
        { model: Client, required: true, attributes: ["name", "company_name"] },
      ],
    });
    if (!project) {
      return res.status(404).send({ message: "Project not found" });
    }
    res.status(200).send(project);
  } catch (error) {
    errorHandler(res, error);
  }
};

const updateProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = projectValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }
    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).send({ message: "Project not found" });
    }
    const { clientId, title, description, budget, deadline, status } = value;

    const updatedProject = await Project.update(
      {
        clientId,
        title,
        description,
        budget,
        deadline,
        status,
      },
      {
        where: { id },
        returning: true,
      }
    );
    if (!updatedProject) {
      return res.status(500).send({
        error: "Internal Server Error",
      });
    }

    res.status(200).send({
      message: "Project updated successfully",
      project: updatedProject[1][0],
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const deleteProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).send({
        error: "Project not found",
      });
    }
    await project.destroy();
    return res.status(200).send({
      message: "Project deleted successfully",
      data: project,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

module.exports = {
  addProject,
  getProjects,
  getProjectById,
  updateProjectById,
  deleteProjectById,
};
