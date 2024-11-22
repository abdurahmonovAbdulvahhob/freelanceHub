const { errorHandler } = require("../helpers/error_handler");
const Freelancer = require("../models/freelancer");

const uuid = require("uuid");
const bcrypt = require("bcrypt");

const myJwt = require("../services/jwt_service");

const config = require("config");
const { freelancerValidation } = require("../validations/freelancer.validation");
const { to } = require("../helpers/to_promise");
const mail_service = require("../services/mail_service");
const Skill = require("../models/skill");

const RegisterFreelancer = async (req, res) => {
  try {
    const { error, value } = freelancerValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }

    const { name, email, phone_number, experience_year } = value;

    const freelancerExists = await Freelancer.findOne({ where: { email: email } });
    if (freelancerExists) {
      return res
        .status(400)
        .send({ message: "Freelancer with this email already exists" });
    }

    const activation_link = uuid.v4();

    const newFreelancer = await Freelancer.create({
      name,
      email,
      phone_number,
      experience_year,
      activation_link,
    });

    await mail_service.sendActivationMail(
      email,
      `${config.get("api_url")}:${config.get(
        "port"
      )}/api/freelancer/activate/${activation_link}`
    );

    const payload = {
      id: newFreelancer.id,
      email: newFreelancer.email,
      is_active: newFreelancer.is_active,
    };

    const tokens = myJwt.generateTokens(payload);
    newFreelancer.token = tokens.refreshToken;
    await newFreelancer.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("refresh_time_ms"),
    });

    res.status(201).send({
      message: "Freelancer registered successfully",
      freelancer: newFreelancer,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const LoginFreelancer = async (req, res) => {
  try {
    const { email } = req.body;
    const freelancer = await Freelancer.findOne({ where: { email } });
    if (!freelancer) {
      return res.status(400).send({ message: "Email  invalid" });
    }

    const payload = {
      id: freelancer.id,
      email: freelancer.email,
      is_active: freelancer.is_active,
    };

    const tokens = myJwt.generateTokens(payload);
    freelancer.token = tokens.refreshToken;
    await freelancer.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("refresh_time_ms"),
    });

    res.status(200).send({
      message: "Freelancer logged in successfully",
      id: freelancer.id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const LogoutFreelancer = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(400).send({ message: "Token is invalid" });
    }

    const freelancer = await Freelancer.findOne({ where: { token: refreshToken } });

    if (!freelancer) {
      return res.status(400).send({ message: "Token is invalid" });
    }

    await freelancer.update({ token: "" });

    res.clearCookie("refreshToken");

    res
      .status(200)
      .send({ message: "Freelancer logged out successfully", refreshToken });
  } catch (error) {
    errorHandler(res, error);
  }
};

const RefreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(403).send({ message: "Token is not found in cookies" });
    }

    const [error, decodedRefreshToken] = await to(
      myJwt.verifyRefreshToken(refreshToken)
    );
    if (error) {
      return res.status(403).send({ message: error.message });
    }

    const freelancerFromDB = await Freelancer.findOne({
      where: { token: refreshToken },
    });
    if (!freelancerFromDB) {
      return res
        .status(403)
        .send({ message: "Access denied freelancer(refreshToken is invalid)" });
    }

    const payload = {
      id: freelancerFromDB.id,
      email: freelancerFromDB.email,
      is_active: freelancerFromDB.is_active,
    };

    const tokens = myJwt.generateTokens(payload);
    freelancerFromDB.token = tokens.refreshToken;
    await freelancerFromDB.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("refresh_time_ms"),
    });

    res.status(200).send({
      message: "Refresh token updated successfully",
      id: freelancerFromDB.id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getFreelancers = async (req, res) => {
  try {
    const freelancers = await Freelancer.findAll({
      include: [
        {model: Skill, required: true, attributes: ["skill"]},
      ]
    });
    if (!freelancers) {
      return res.status(400).send({ message: "No freelancers found" });
    }
    res.status(200).send(freelancers);
  } catch (error) {
    errorHandler(res, error);
  }
};

const getFreelancerById = async (req, res) => {
  try {
    const { id } = req.params;
    const freelancer = await Freelancer.findByPk(id);
    if (!freelancer) {
      return res.status(404).send({ message: "Freelancer not found" });
    }
    res.status(200).send(freelancer);
  } catch (error) {
    errorHandler(res, error);
  }
};

const updateFreelancerById = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = freelancerValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }
    const freelancer = await Freelancer.findByPk(id);
    if (!freelancer) {
      return res.status(404).send({ message: "Freelancer not found" });
    }
    const { name, email, phone_number, experience_year } = value;
    const freelancerExists = await Freelancer.findOne({ where: { email: email } });
    if (freelancerExists) {
      return res
        .status(400)
        .send({ message: "Freelancer with this email already exists" });
    }
    const freelancer_id = req.freelancer.id;
    if (freelancer_id != id) {
      return res.status(403).send({ message: "Access denied" });
    }
    const updatedFreelancer = await Freelancer.update(
      {
        name,
        email,
        phone_number,
        experience_year,
      },
      {
        where: { id },
        returning: true,
      }
    );
    if (!updatedFreelancer) {
      return res.status(500).send({
        error: "Internal Server Error",
      });
    }

    res.status(200).send({
      message: "Freelancer updated successfully",
      freelancer: updatedFreelancer[1][0],
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const deleteFreelancerById = async (req, res) => {
  try {
    const { id } = req.params;
    const freelancer = await Freelancer.findByPk(id);
    if (!freelancer) {
      return res.status(404).send({
        error: "Freelancer not found",
      });
    }
    await freelancer.destroy();
    return res.status(200).send({
      message: "Freelancer deleted successfully",
      data: freelancer,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const freelancerActivate = async (req, res) => {
  try {
    const link = req.params.link;
    const freelancer = await Freelancer.findOne({ where: { activation_link: link } });
    if (!freelancer) {
      return res.status(404).send({ message: "Freelancer mavjud emas" });
    }
    if (freelancer.is_active) {
      return res.status(400).send({ message: "Freelancer already activated" });
    }
    freelancer.is_active = true;
    await freelancer.save();
    res.send({
      message: "Freelancer activated successfully",
      is_active: freelancer.is_active,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

module.exports = {
  RegisterFreelancer,
  LoginFreelancer,
  LogoutFreelancer,
  RefreshToken,
  getFreelancers,
  getFreelancerById,
  updateFreelancerById,
  deleteFreelancerById,
  freelancerActivate,
};
