import { UsersModel } from "./model.js";
import AppointmentModel from "./appointmentModel.js";
import RestaurateurService from "./RestaurateurServices.js";

// Client -> Appointments
UsersModel.hasMany(AppointmentModel, {
  foreignKey: "clientId",
  as: "appointments",
});

AppointmentModel.belongsTo(UsersModel, {
  foreignKey: "clientId",
  as: "clientUser",
});

// Restaurateur (formerly restaurant) associations
AppointmentModel.belongsTo(UsersModel, {
  foreignKey: "restaurateurId",
  as: "restaurateurUser",
});

UsersModel.hasMany(RestaurateurService, {
  foreignKey: "restaurateurId",
  as: "services",
});

RestaurateurService.belongsTo(UsersModel, {
  foreignKey: "restaurateurId",
  as: "restaurateur",
});

RestaurateurService.hasMany(AppointmentModel, {
  foreignKey: "serviceId",
  as: "appointments",
});

AppointmentModel.belongsTo(RestaurateurService, {
  foreignKey: "serviceId",
  as: "service",
});

export { UsersModel, AppointmentModel, RestaurateurService };
