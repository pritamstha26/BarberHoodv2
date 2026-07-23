import { DataTypes } from "sequelize";

import sequelize from "../config/db.js";
import { UsersModel } from "./model.js";

export const RestaurateurService = sequelize.define("RestaurateurService", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  restaurateurId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: UsersModel,
      key: "id",
    },
  },
}, {
  tableName: "RestaurateurServices",
  indexes: [
    {
      fields: ["restaurateurId"],
    },
    {
      unique: true,
      fields: ["restaurateurId", "name"],
    },
  ],
});

export default RestaurateurService;

// (async () => {
//   await RestaurateurService.sync({ alter: true }); // alter: true updates table structure if changed
//   console.log("RestaurateurService table synced.");
// })();
