import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";

const UsersModel = sequelize.define("UsersModel", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  phone_number: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true,
  },
  location_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  seat_capacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 10,
  },
  role: {
    type: DataTypes.ENUM("client", "admin", "restaurateurs"),
    defaultValue: "client",
  },
});

export { UsersModel };
