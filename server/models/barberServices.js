import { DataTypes } from "sequelize";

import sequelize from "../config/db.js";

export const BarberService = sequelize.define("BarberService", {
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

export default BarberService;

(async () => {
  await BarberService.sync({ alter: true }); // alter: true updates table structure if changed
  console.log("YourModel table synced.");
})();
