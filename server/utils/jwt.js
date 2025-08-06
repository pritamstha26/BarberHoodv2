import jwt from "jsonwebtoken";
import { query } from "../config/db.js";

// Generate JWT token
export const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Verify JWT token
export const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    let user;
    if (decoded.role === "client") {
      const result = await query("SELECT * FROM clients WHERE client_id = $1", [
        decoded.id,
      ]);
      user = result.rows[0];
    } else if (decoded.role === "admin") {
      const result = await query("SELECT * FROM admins WHERE admin_id = $1", [
        decoded.id,
      ]);
      user = result.rows[0];
    }

    if (!user) throw new Error("User no longer exists");
    return user;
  } catch (err) {
    throw new Error("Invalid token");
  }
};

// Attach token to response
export const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.client_id || user.admin_id, user.role);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: user,
  });
};
