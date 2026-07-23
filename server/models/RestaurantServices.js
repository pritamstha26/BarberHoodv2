import { DataTypes } from "sequelize";

import sequelize from "../config/db.js";

export const restaurantService = sequelize.define("restaurantService", {
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

export default restaurantService;

// (async () => {
//   await Restaurant.sync({ alter: true }); // alter: true updates table structure if changed
//   console.log("YourModel table synced.");
// })();
