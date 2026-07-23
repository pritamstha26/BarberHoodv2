import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import sequelize from "./config/db.js";
import { UsersModel } from "./models/model.js";

const createAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");

    const email = "admin@gmail.com";
    const existing = await UsersModel.findOne({ where: { email } });

    if (existing) {
      console.log("Admin account already exists:", email);
      process.exit(0);
    }

    const password = "superadmin";
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await UsersModel.create({
      first_name: "Admin",
      last_name: "User",
      email,
      password: hashedPassword,
      role: "admin",
      phone_number: null,
    });

    console.log("Admin account created successfully:");
    console.log({ id: admin.id, email: admin.email, role: admin.role });
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("Failed to create admin account:", error);
    process.exit(1);
  }
};

createAdmin();
