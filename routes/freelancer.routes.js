const { Router } = require("express");
const {
  RegisterFreelancer,
  LoginFreelancer,
  LogoutFreelancer,
  RefreshToken,
  getFreelancers,
  getFreelancerById,
  updateFreelancerById,
  deleteFreelancerById,
  freelancerActivate,
} = require("../controllers/freelancer.controller");
const freelancer_police = require("../middleware/freelancer_police");

const router = Router();

router.post("/register", RegisterFreelancer);
router.post("/login", LoginFreelancer);
router.post("/logout", LogoutFreelancer);
router.post("/refresh", RefreshToken);

router.get("/", getFreelancers);
router.get("/:id",  getFreelancerById);
router.get("/activate/:link", freelancerActivate);

router.put("/update/:id", freelancer_police,updateFreelancerById);

router.delete("/delete/:id", freelancer_police, deleteFreelancerById);

module.exports = router;
