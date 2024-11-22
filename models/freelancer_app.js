const sequelize = require("../config/db");

const { DataTypes } = require("sequelize");
const Freelancer = require("./freelancer");

const Project = require("./project");
const Payment = require("./payment");


const Freelancer_App = sequelize.define(
  "freelancer_app",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    application_status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected"),
      defaultValue: "pending",
    }
  },
  {
    timestamps: false,
  }
);

Project.belongsToMany(Freelancer, { through: Freelancer_App });
Freelancer.belongsToMany(Project, { through: Freelancer_App });

Project.hasMany(Freelancer_App);
Freelancer_App.belongsTo(Project);

Freelancer.hasMany(Freelancer_App);
Freelancer_App.belongsTo(Freelancer);

Freelancer_App.hasMany(Payment)
Payment.belongsTo(Freelancer_App)

module.exports = Freelancer_App;
