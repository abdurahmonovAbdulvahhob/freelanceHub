
const { errorHandler } = require("../helpers/error_handler");

const Freelancer_Skill = require("../models/freelancer_skill");

const { freelancer_skillValidation } = require("../validations/freelancer_skill.validation");
const Freelancer = require("../models/freelancer");
const Skill = require("../models/skill");

const addFreelancer_Skill = async (req, res) => {
  try {
    const { error, value } = freelancer_skillValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }

    const { freelancerId, skillId } = value;

    const newFreelancer_Skill = await Freelancer_Skill.create({
      freelancerId,
      skillId
    });

    console.log(newFreelancer_Skill);
    

    res.status(201).send({
      message: "Freelancer_Skill added successfully",
      freelancer_skill: newFreelancer_Skill,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getFreelancer_Skills = async (req, res) => {
  try {
    const freelancer_skills = await Freelancer_Skill.findAll({
      include: [
        { model: Freelancer, required: true, attributes: ["name"] },
        { model: Skill, required: true, attributes: ["skill"] },
      ],
    });
    if (!freelancer_skills) {
      return res.status(400).send({ message: "No freelancer_skills found" });
    }
    res.status(200).send(freelancer_skills);
  } catch (error) {
    errorHandler(res, error);
  }
};

const getFreelancer_SkillById = async (req, res) => {
  try {
    const { id } = req.params;
    const freelancer_skill = await Freelancer_Skill.findByPk(id, {
      include: [
        { model: Freelancer, required: true, attributes: ["name"] },
        { model: Skill, required: true, attributes: ["skill"] },
      ],
    });
    if (!freelancer_skill) {
      return res.status(404).send({ message: "Freelancer_Skill not found" });
    }
    res.status(200).send(freelancer_skill);
  } catch (error) {
    errorHandler(res, error);
  }
};

const updateFreelancer_SkillById = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = freelancer_skillValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }
    const freelancer_skill = await Freelancer_Skill.findByPk(id);
    if (!freelancer_skill) {
      return res.status(404).send({ message: "Freelancer_Skill not found" });
    }
    const { freelancerId, skillId } = value;

    const updatedFreelancer_Skill = await Freelancer_Skill.update(
      {
        freelancerId,
        skillId,
      },
      {
        where: { id },
        returning: true,
      }
    );
    if (!updatedFreelancer_Skill) {
      return res.status(500).send({
        error: "Internal Server Error",
      });
    }

    res.status(200).send({
      message: "Freelancer_Skill updated successfully",
      freelancer_skill: updatedFreelancer_Skill[1][0],
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const deleteFreelancer_SkillById = async (req, res) => {
  try {
    const { id } = req.params;
    const freelancer_skill = await Freelancer_Skill.findByPk(id);
    if (!freelancer_skill) {
      return res.status(404).send({
        error: "Freelancer_Skill not found",
      });
    }
    await freelancer_skill.destroy();
    return res.status(200).send({
      message: "Freelancer_Skill deleted successfully",
      data: freelancer_skill,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

module.exports = {
  addFreelancer_Skill,
  getFreelancer_Skills,
  getFreelancer_SkillById,
  updateFreelancer_SkillById,
  deleteFreelancer_SkillById,
};
