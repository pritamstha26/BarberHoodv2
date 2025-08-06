import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";
import ServiceModel from "./service.js"; // Adjust the import based on your project structure
import { UsersModel } from "./model.js";
UsersModel;
const AppointmentModel = sequelize.define("AppointmentModel", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  serviceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ServiceModel, // Assuming you have a ServiceModel defined
      key: "id",
    },
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: UsersModel,
      key: "id",
    },
  },
  barberId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: UsersModel,
      key: "id",
    },
  },
  status: {
    type: DataTypes.ENUM("pending", "accepted", "rejected", "cancelled"),
    defaultValue: "pending",
  },
});

export default AppointmentModel;
