const { to } = require("../helpers/to_promise");
const myJwt = require("../services/free_jwt_service");
module.exports = async function (req, res, next) {
  try {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res.status(403).send({ message: "Token berilmagan" });
    }
    
    const bearer = authorization.split(" ")[0];
    const token = authorization.split(" ")[1];

    if (bearer !== "Bearer" || !token) {
      return res.status(403).send({ message: "Token noto'g'ri" });
    }

    const [error, decodedToken] = await to(myJwt.verifyAccessToken(token));
    if (error) {
      return res.status(403).send({ message: error.message });
    }
    req.freelancer = decodedToken; 
    next();
  } catch (error) {
    console.log(error);
    res.status(403).send({ message: `Freelancer ro'yxatdan o'tmagan` });
  }
};
