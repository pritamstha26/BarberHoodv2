import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";
import ServiceModel from "./service.js";
import { UsersModel } from "./model.js";

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
      model: ServiceModel,
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
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 40, // Regular priority
    allowNull: false,
  },
  clientType: {
    type: DataTypes.ENUM("regular", "vip", "premium", "emergency", "walk_in"),
    defaultValue: "regular",
  },
  isReschedule: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  queuePosition: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  estimatedStartTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

// Associations remain the same
AppointmentModel.belongsTo(UsersModel, {
  foreignKey: "clientId",
  as: "client",
});

AppointmentModel.belongsTo(UsersModel, {
  foreignKey: "barberId",
  as: "barber",
});

AppointmentModel.belongsTo(ServiceModel, {
  foreignKey: "serviceId",
  as: "service",
});

export default AppointmentModel;
