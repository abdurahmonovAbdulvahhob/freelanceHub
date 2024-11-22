const { Router } = require("express");
const { addFreelancer_Skill, getFreelancer_Skills, getFreelancer_SkillById, updateFreelancer_SkillById, deleteFreelancer_SkillById } = require("../controllers/freelancer_skills.controller");


const router = Router();

router.post("/add", addFreelancer_Skill);

router.get("/", getFreelancer_Skills);
router.get("/:id", getFreelancer_SkillById);

router.put("/update/:id", updateFreelancer_SkillById);

router.delete("/delete/:id", deleteFreelancer_SkillById);

module.exports = router;
