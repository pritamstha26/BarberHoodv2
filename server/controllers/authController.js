import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UsersModel } from "../models/model.js";

export const register = async (req, res) => {
  try {
    const password = req.body["password"];
    const hashedPassword = await bcrypt.hash(password, 10);
    req.body.password = hashedPassword;

    const found = await UsersModel.findOne({
      where: { email: req.body["email"] },
    });

    if (found) {
      return res
        .status(400)
        .json({ exists: true, message: "Email already registered" });
    }

    const user = await UsersModel.create(req.body);
    const token = createToken(user);
    return res.status(201).json({
      message: "User registered successfully",
      access_token: token,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await UsersModel.findOne({ where: { email, role } });

    if (!user) {
      return res.status(404).json({ message: "Invalid user" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createToken(user);
    return res.status(200).json({
      message: "Login successful",
      access_token: token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};
