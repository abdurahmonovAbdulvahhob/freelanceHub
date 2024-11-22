const { errorHandler } = require("../helpers/error_handler");
const Client = require("../models/client");

const uuid = require("uuid");
const bcrypt = require("bcrypt");

const myJwt = require("../services/jwt_service");

const config = require("config");
const { clientValidation } = require("../validations/client.validation");
const { to } = require("../helpers/to_promise");
const mail_service = require("../services/mail_service");
const Project = require("../models/project");

const RegisterClient = async (req, res) => {
  try {
    const { error, value } = clientValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }

    const { name, email, phone_number, company_name } = value;

    const clientExists = await Client.findOne({ where: { email: email } });
    if (clientExists) {
      return res
        .status(400)
        .send({ message: "Client with this email already exists" });
    }

    const activation_link = uuid.v4();

    const newClient = await Client.create({
      name,
      email,
      phone_number,
      company_name,
      activation_link,
    });

    await mail_service.sendActivationMail(
      email,
      `${config.get("api_url")}:${config.get(
        "port"
      )}/api/client/activate/${activation_link}`
    );

    const payload = {
      id: newClient.id,
      email: newClient.email,
      is_active: newClient.is_active,
    };

    const tokens = myJwt.generateTokens(payload);
    newClient.token = tokens.refreshToken;
    await newClient.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("refresh_time_ms"),
    });

    res.status(201).send({
      message: "Client registered successfully",
      client: newClient,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const LoginClient = async (req, res) => {
  try {
    const { email, phone_number } = req.body;
    const client = await Client.findOne({ where: { email } });
    if (!client) {
      return res.status(400).send({ message: "Email  invalid" });
    }

    const payload = {
      id: client.id,
      email: client.email,
      is_active: client.is_active,
    };

    const tokens = myJwt.generateTokens(payload);
    client.token = tokens.refreshToken;
    await client.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("refresh_time_ms"),
    });

    res.status(200).send({
      message: "Client logged in successfully",
      id: client.id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const LogoutClient = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(400).send({ message: "Token is invalid" });
    }

    const client = await Client.findOne({ where: { token: refreshToken } });

    if (!client) {
      return res.status(400).send({ message: "Token is invalid" });
    }

    await client.update({ token: "" });

    res.clearCookie("refreshToken");

    res
      .status(200)
      .send({ message: "Client logged out successfully", refreshToken });
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

    const clientFromDB = await Client.findOne({
      where: { token: refreshToken },
    });
    if (!clientFromDB) {
      return res
        .status(403)
        .send({ message: "Access denied client(refreshToken is invalid)" });
    }

    const payload = {
      id: clientFromDB.id,
      email: clientFromDB.email,
      is_active: clientFromDB.is_active,
    };

    const tokens = myJwt.generateTokens(payload);
    clientFromDB.token = tokens.refreshToken;
    await clientFromDB.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("refresh_time_ms"),
    });

    res.status(200).send({
      message: "Refresh token updated successfully",
      id: clientFromDB.id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getClients = async (req, res) => {
  try {
    const clients = await Client.findAll({
      include: [
        {
          model: Project,
          as: "projects",
          attributes: ["title", "description", "budget", "deadline", "status"],
        },
      ],
    });
    if (!clients) {
      return res.status(400).send({ message: "No clients found" });
    }
    res.status(200).send(clients);
  } catch (error) {
    errorHandler(res, error);
  }
};

const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByPk(id, {
      include: [
        {
          model: Project,
          as: "projects",
          required: true,
          attributes: ["title", "description", "budget", "deadline", "status"],
        },
      ],
    });
    if (!client) {
      return res.status(404).send({ message: "Client not found" });
    }
    res.status(200).send(client);
  } catch (error) {
    errorHandler(res, error);
  }
};

const updateClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = clientValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }
    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).send({ message: "Client not found" });
    }
    const { name, email, phone_number, company_name } = value;
    const clientExists = await Client.findOne({ where: { email: email } });
    if (clientExists) {
      return res
        .status(400)
        .send({ message: "Client with this email already exists" });
    }
    const client_id = req.client.id;
    if (client_id != id) {
      return res.status(403).send({ message: "Access denied" });
    }
    const updatedClient = await Client.update(
      {
        name,
        email,
        phone_number,
        company_name,
      },
      {
        where: { id },
        returning: true,
      }
    );
    if (!updatedClient) {
      return res.status(500).send({
        error: "Internal Server Error",
      });
    }

    res.status(200).send({
      message: "Client updated successfully",
      client: updatedClient[1][0],
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const deleteClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).send({
        error: "Client not found",
      });
    }
    await client.destroy();
    return res.status(200).send({
      message: "Client deleted successfully",
      data: client,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const clientActivate = async (req, res) => {
  try {
    const link = req.params.link;
    const client = await Client.findOne({ where: { activation_link: link } });
    if (!client) {
      return res.status(404).send({ message: "Client mavjud emas" });
    }
    if (client.is_active) {
      return res.status(400).send({ message: "Client already activated" });
    }
    client.is_active = true;
    await client.save();
    res.send({
      message: "Client activated successfully",
      is_active: client.is_active,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

module.exports = {
  RegisterClient,
  LoginClient,
  LogoutClient,
  RefreshToken,
  getClients,
  getClientById,
  updateClientById,
  deleteClientById,
  clientActivate,
};
