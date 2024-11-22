const sequelize = require("../config/db");

const { DataTypes } = require("sequelize");
const Freelancer = require("./freelancer");
const Skill = require("./skill");

const Freelancer_Skill = sequelize.define(
  "freelancer_skill",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  {
    timestamps: false,
  }
);

Freelancer.belongsToMany(Skill, { through: Freelancer_Skill });
Skill.belongsToMany(Freelancer, { through: Freelancer_Skill });

Freelancer_Skill.belongsTo(Skill);
Skill.hasMany(Freelancer_Skill);

Freelancer_Skill.belongsTo(Freelancer);
Freelancer.hasMany(Freelancer_Skill);

module.exports = Freelancer_Skill;
