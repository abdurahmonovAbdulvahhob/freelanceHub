const { required } = require("joi");
const { errorHandler } = require("../helpers/error_handler");

const Skill = require("../models/skill");

const { skillValidation } = require("../validations/skill.validation");
const Freelancer = require("../models/freelancer");

const addSkill = async (req, res) => {
  try {
    const { error, value } = skillValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }

    const { skill } = value;

    const newSkill = await Skill.create({
      skill,
    });

    res.status(201).send({
      message: "Skill added successfully",
      skill: newSkill,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getSkills = async (req, res) => {
  try {
    const skills = await Skill.findAll({
      include: [
        { model: Freelancer, required: true, attributes: ["name"] },
      ],
    });
    if (!skills) {
      return res.status(400).send({ message: "No skills found" });
    }
    res.status(200).send(skills);
  } catch (error) {
    errorHandler(res, error);
  }
};

const getSkillById = async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findByPk(id, {
      include: [
        { model: Freelancer, required: true, attributes: ["name"] },
      ],
    });
    if (!skill) {
      return res.status(404).send({ message: "Skill not found" });
    }
    res.status(200).send(skill);
  } catch (error) {
    errorHandler(res, error);
  }
};

const updateSkillById = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = skillValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }
    const newskill = await Skill.findByPk(id);
    if (!newskill) {
      return res.status(404).send({ message: "Skill not found" });
    }
    const { skill } = value;

    const updatedSkill = await Skill.update(
      {
        skill,
      },
      {
        where: { id },
        returning: true,
      }
    );
    if (!updatedSkill) {
      return res.status(500).send({
        error: "Internal Server Error",
      });
    }

    res.status(200).send({
      message: "Skill updated successfully",
      skill: updatedSkill[1][0],
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const deleteSkillById = async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findByPk(id);
    if (!skill) {
      return res.status(404).send({
        error: "Skill not found",
      });
    }
    await skill.destroy();
    return res.status(200).send({
      message: "Skill deleted successfully",
      data: skill,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

module.exports = {
  addSkill,
  getSkills,
  getSkillById,
  updateSkillById,
  deleteSkillById,
};
