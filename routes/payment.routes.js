const { Router } = require("express");
const { addPayment, getPayments, getPaymentById, updatePaymentById, deletePaymentById } = require("../controllers/payment.controller");

const router = Router();

router.post("/add", addPayment);

router.get("/", getPayments);
router.get("/:id", getPaymentById);

router.put("/update/:id", updatePaymentById);

router.delete("/delete/:id", deletePaymentById);

module.exports = router;
