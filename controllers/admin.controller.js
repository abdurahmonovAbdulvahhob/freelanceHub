const { errorHandler } = require("../helpers/error_handler");
const Admin = require("../models/admin");

const bcrypt = require("bcrypt");

const myJwt = require("../services/jwt_service");

const config = require("config");
const { adminValidation } = require("../validations/admin.validation");
const { to } = require("../helpers/to_promise");
const Client = require("../models/client");

const RegisterAdmin = async (req, res) => {
  try {
    const { error, value } = adminValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }
    const { name, email, password } = value;

    const adminExists = await Admin.findOne({ where: { email: email } });
    if (adminExists) {
      return res
        .status(400)
        .send({ message: "Admin with this email already exists" });
    }

    const password_hash = bcrypt.hashSync(password, 7);
    const newAdmin = await Admin.create({ name, email, password_hash });

    const payload = {
      id: newAdmin.id,
      email: newAdmin.email,
      is_active: newAdmin.is_active,
      is_creator: newAdmin.is_creator
    };

    const tokens = myJwt.generateTokens(payload);
    newAdmin.token = tokens.refreshToken;
    await newAdmin.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("refresh_time_ms"),
    });

    res.status(201).send({
      message: "Admin registered successfully",
      admin: newAdmin,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const LoginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(400).send({ message: "Email or password invalid" });
    }
    const validPassword = bcrypt.compareSync(password, admin.password_hash);
    if (!validPassword) {
      return res.status(400).send({ message: "Email or password invalid" });
    }
    const payload = {
      id: admin.id,
      email: admin.email,
      is_active: admin.is_active,
      is_creator: admin.is_creator
    };

    const tokens = myJwt.generateTokens(payload);
    admin.token = tokens.refreshToken;
    await admin.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("refresh_time_ms"),
    });

    res.status(200).send({
      message: "Admin logged in successfully",
      id: admin.id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const LogoutAdmin = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(400).send({ message: "Token is invalid" });
    }

    const admin = await Admin.findOne({ where: { token: refreshToken } });

    if (!admin) {
      return res.status(400).send({ message: "Token is invalid" });
    }

    await admin.update({ token: "" });

    res.clearCookie("refreshToken");

    res
      .status(200)
      .send({ message: "Admin logged out successfully", refreshToken });
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

    const adminFromDB = await Admin.findOne({ where: { token: refreshToken } });
    if (!adminFromDB) {
      return res.status(403).send({ message: "Access denied admin(refreshToken is invalid)" });
    }

    const payload = {
      id: adminFromDB.id,
      email: adminFromDB.email,
      is_active: adminFromDB.is_active,
      is_creator: adminFromDB.is_creator
    }

    const tokens = myJwt.generateTokens(payload);
    adminFromDB.token = tokens.refreshToken;
    await adminFromDB.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("refresh_time_ms"),
    });

    res.status(200).send({
      message: "Refresh token updated successfully",
      id: adminFromDB.id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};


const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll();
    res.status(200).send(admins);
  } catch (error) {
    errorHandler(res, error);
  }
}

const getAdminById = async (req, res) => {
  try {
    const {id} = req.params;
    const admin = await Admin.findByPk(id)
    if (!admin) {
      return res.status(404).send({ message: "Admin not found" });
    }
    const admin_id = req.admin.id;
    if (admin_id != id) {
      return res.status(403).send({ message: "Access denied" });
    }
    res.status(200).send(admin);
  } catch (error) {
    errorHandler(res,error)
  }
}

const updateAdminById = async (req, res) => {
  try {
    const {id} = req.params;
    const {error, value} = adminValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }
    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).send({ message: "Admin not found" });
    }
    const {name, email, password} = value;
    const adminExists = await Admin.findOne({ where: { email: email } });
    if (adminExists) {
      return res
        .status(400)
        .send({ message: "Admin with this email already exists" });
    }
    const admin_id = req.admin.id;
    if (admin_id != id) {
      return res.status(403).send({ message: "Access denied" });
    }
    const password_hash = bcrypt.hashSync(password, 7);

    const updatedAdmin = await Admin.update({
      name,
      email,
      password_hash,
    },{
      where: { id },
      returning: true,
    })
    if (!updatedAdmin) {
      return res.status(500).send({
        error: "Internal Server Error",
      });
    }

    res.status(200).send({
      message: "Admin updated successfully",
      admin: updatedAdmin[1][0],
    });
  } catch (error) {
    errorHandler(res,error)
  }
}

const deleteAdminById = async (req, res) => {
  try {
    const {id} = req.params;
    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).send({
        error: "Admin not found",
      });
    }
    const admin_id = req.admin.id;
    if (admin_id != id) {
      return res.status(403).send({ message: "Access denied" });
    }
    await admin.destroy();
    return res.status(200).send({
      message: "Admin deleted successfully",
      data: admin,
    });
  } catch (error) {
    errorHandler(res,error)
  }
}

module.exports = {
  RegisterAdmin,
  LoginAdmin,
  LogoutAdmin,
  RefreshToken,
  getAdmins,
  getAdminById,
  updateAdminById,
  deleteAdminById,
};
