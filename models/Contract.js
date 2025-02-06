const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Contract = sequelize.define("Contract", {
  listingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  farmerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "active", "completed", "cancelled"),
    defaultValue: "pending",
  },
});

module.exports = Contract;
