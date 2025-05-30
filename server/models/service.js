import { UsersModel } from "./model.js"; // Assuming you have a Users modelS
const ServiceModel = sequelize.define(
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
    deadline: {
      type: DataTypes.DATE, // Duration in minutes
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
        model: UsersModel, // Assuming you have a Users model
        key: "id",
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

export default ServiceModel;
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js"; // Adjust the import based on your project structure
