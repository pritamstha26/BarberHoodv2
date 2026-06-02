import { DataTypes } from "sequelize";

import sequelize from "../config/db.js";

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
});

export default RestaurateurService;

// (async () => {
//   await RestaurateurService.sync({ alter: true }); // alter: true updates table structure if changed
//   console.log("RestaurateurService table synced.");
// })();
