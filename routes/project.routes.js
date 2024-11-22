const { Router } = require("express");
const {
  getProjects,
  getProjectById,
  updateProjectById,
  deleteProjectById,
  addProject,
} = require("../controllers/project.controller");
// const project_police = require("../middleware/project_police");

const router = Router();

router.post("/add", addProject);


router.get("/", getProjects);
router.get("/:id", getProjectById);


router.put("/update/:id", updateProjectById);

router.delete("/delete/:id", deleteProjectById);

module.exports = router;
