import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";
import { UsersModel } from "./model.js";
import AppointmentModel from "./appointmentModel.js";

const RatingModel = sequelize.define("RatingModel", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  appointmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: AppointmentModel,
      key: "id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
  raterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: UsersModel,
      key: "id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
  rateeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: UsersModel,
      key: "id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  targetType: {
    type: DataTypes.ENUM("client", "restaurateur"),
    allowNull: false,
  },
}, {
  tableName: "ratings",
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ["appointmentId", "raterId", "targetType"],
    },
    {
      fields: ["rateeId"],
    },
    {
      fields: ["raterId"],
    },
  ],
});

// Associations
RatingModel.belongsTo(AppointmentModel, {
  foreignKey: "appointmentId",
  as: "appointment",
});

RatingModel.belongsTo(UsersModel, {
  foreignKey: "raterId",
  as: "rater",
});

RatingModel.belongsTo(UsersModel, {
  foreignKey: "rateeId",
  as: "ratee",
});

export default RatingModel;
