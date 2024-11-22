const { Router } = require("express");

const adminRouter = require("./admin.routes");
const clientRouter = require("./client.routes");
const freelancerRouter = require("./freelancer.routes");
const projectRouter = require("./project.routes");
const paymentRouter = require("./payment.routes");
const skillRouter = require("./skill.routes");
const freelancer_skillRouter = require("./freelancer_skill.routes");
const freelancer_appRouter = require("./freelancer_app.routes");


const router = Router();


router.use('/admin', adminRouter);

router.use("/client", clientRouter);

router.use("/freelancer", freelancerRouter);

router.use("/project", projectRouter);

router.use("/payment", paymentRouter);

router.use("/skill", skillRouter);

router.use("/freelancer_skill", freelancer_skillRouter);

router.use("/freelancer_app", freelancer_appRouter);


module.exports = router;
