import jwt from "jsonwebtoken";
import { AppError } from "../utils/error.js";
import { UsersModel } from "../models/model.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access token required" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UsersModel.findByPk(decoded.id, {
      attributes: [
        "id",
        "first_name",
        "last_name",
        "email",
        "role",
        "phone_number",
      ],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};