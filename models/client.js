const sequelize = require('../config/db')

const {DataTypes} = require('sequelize');
const Project = require('./project');

const Client = sequelize.define("client", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  phone_number: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  company_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  token: {
    type: DataTypes.STRING,
    unique: true,
  },
  activation_link: {
    type: DataTypes.STRING,
  }
},
{
  timestamps: false,
},
); 

Client.hasMany(Project)
Project.belongsTo(Client)

module.exports = Client;