const { Router } = require("express");
const { addFreelancer_App, getFreelancer_Apps, getFreelancer_AppById, updateFreelancer_AppById, deleteFreelancer_AppById } = require("../controllers/freelancer_app.controller.");

const router = Router();

router.post("/add", addFreelancer_App);

router.get("/", getFreelancer_Apps);
router.get("/:id", getFreelancer_AppById);

router.put("/update/:id", updateFreelancer_AppById);

router.delete("/delete/:id", deleteFreelancer_AppById);

module.exports = router;
