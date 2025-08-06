import { UsersModel } from "./model.js";
import AppointmentModel from "./appointmentModel.js";
import ServiceModel from "./service.js";

UsersModel.hasMany(AppointmentModel, {
  foreignKey: "clientId",
  as: "appointments",
});

AppointmentModel.belongsTo(UsersModel, {
  foreignKey: "clientId",
  as: "clientUser",
});

AppointmentModel.belongsTo(UsersModel, {
  foreignKey: "barberId",
  as: "barberUser",
});

UsersModel.hasMany(ServiceModel, {
  foreignKey: "barberId",
  as: "services",
});

ServiceModel.belongsTo(UsersModel, {
  foreignKey: "barberId",
  as: "barber",
});

ServiceModel.hasMany(AppointmentModel, {
  foreignKey: "serviceId",
  as: "appointments",
});

AppointmentModel.belongsTo(ServiceModel, {
  foreignKey: "serviceId",
  as: "service",
});

export { UsersModel, AppointmentModel, ServiceModel };
