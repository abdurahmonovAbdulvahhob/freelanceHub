const { Router } = require("express");
const { addSkill, getSkills, getSkillById, updateSkillById, deleteSkillById } = require("../controllers/skill.controller");

const router = Router();

router.post("/add", addSkill);

router.get("/", getSkills);
router.get("/:id", getSkillById);

router.put("/update/:id", updateSkillById);

router.delete("/delete/:id", deleteSkillById);

module.exports = router;
