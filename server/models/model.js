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
  role: {
    type: DataTypes.ENUM("client", "admin", "barber"),
    defaultValue: "client",
  },
});

export { UsersModel };
