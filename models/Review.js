const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Review = sequelize.define("Review", {
  reviewerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reviewedUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  contractId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 },
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

module.exports = Review;
