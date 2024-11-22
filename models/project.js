const sequelize = require('../config/db')

const {DataTypes} = require('sequelize')

const Project = sequelize.define("project", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
  },
  budget: {
    type: DataTypes.DECIMAL(15,2),
  },
  deadline: {
    type: DataTypes.DATEONLY(),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'ongoing', 'completed', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false,
  },
  
},
{
  timestamps: false,
},
); 

module.exports = Project;