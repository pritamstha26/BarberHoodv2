import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { UsersModel } from "./model.js";

export const ServiceModel = sequelize.define(
  "ServiceModel",
  {
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
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    prefer_contact_method: {
      type: DataTypes.ENUM("email", "phone"),
    },
    service_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: UsersModel,
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("completed", "pending", "cancelled", "in_progress"),
      defaultValue: "pending",
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "title", "service_type"],
      },
    ],
  }
);

export default ServiceModel;
