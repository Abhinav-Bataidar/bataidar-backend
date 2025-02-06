const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Payment = sequelize.define("Payment", {
  contractId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  payerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  payeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "completed", "failed"),
    defaultValue: "pending",
  },
  paymentMethod: {
    type: DataTypes.ENUM("bank_transfer", "credit_card", "upi"),
    allowNull: false,
  },
});

module.exports = Payment;
