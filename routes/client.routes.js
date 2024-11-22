const { Router } = require("express");
const {
  RegisterClient,
  LoginClient,
  LogoutClient,
  RefreshToken,
  getClients,
  getClientById,
  updateClientById,
  deleteClientById,
  clientActivate,
} = require("../controllers/client.controller");
const client_police = require("../middleware/client_police");
const creator_police = require("../middleware/creator_police");

const router = Router();

router.post("/register", RegisterClient);
router.post("/login", LoginClient);
router.post("/logout", LogoutClient);
router.post("/refresh", RefreshToken);

router.get("/", getClients);
router.get("/:id", getClientById);
router.get("/activate/:link", clientActivate);


router.put("/update/:id", client_police,updateClientById);

router.delete("/delete/:id", client_police, deleteClientById);

module.exports = router;
