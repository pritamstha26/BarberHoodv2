// import pg from "pg";
// import dotenv from "dotenv";

// dotenv.config();
// const { Pool } = pg;

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

// export const query = (text, params) => pool.query(text, params);
// export default pool;

import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD || "", // Use an empty string if DB_PASSWORD is not set
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: process.env.DB_PORT,
    logging: false, // Disable logging; default: console.log
  }
);

export default sequelize;
export const connectDB = async () => {
  console.log(process.env.DB_PASSWORD);
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};
