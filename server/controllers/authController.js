import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UsersModel } from "../models/model.js";

export const register = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let isAdmin = false;

    // Check if requester is admin by decoding token
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.decode(token);

      const adminUser = await UsersModel.findOne({ where: { id: decoded.id } });
      if (adminUser?.role === "admin") {
        isAdmin = true;
      }
    }

    // Extract password and hash it
    const password = req.body.password;
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if email already exists
    const existingUser = await UsersModel.findOne({
      where: { email: req.body.email },
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ exists: true, message: "Email already registered" });
    }

    let role = "client"; // default role

    const allowedRoles = isAdmin
      ? ["client", "barber", "admin"]
      : ["client", "barber"];

    if (req.body.role) {
      if (allowedRoles.includes(req.body.role)) {
        role = req.body.role;
      } else {
        return res.status(400).json({ message: "Invalid role specified" });
      }
    }

    // Create user data object
    const userData = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      phone_number: req.body.phone_number,
      password: hashedPassword,
      role,
    };

    // Save the new user
    const user = await UsersModel.create(userData);

    // Response depends on who registered
    if (!isAdmin) {
      // Public registration returns token
      const token = createToken(user);
      return res.status(201).json({
        message: "User registered successfully",
        access_token: token,
      });
    }

    // Admin registration returns user info (no token)
    return res.status(201).json({
      message: "User created successfully by admin",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
      },
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

export const decodeToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
