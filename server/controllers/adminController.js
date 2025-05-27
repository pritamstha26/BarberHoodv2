import { query } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO admin (name, email, password) 
       VALUES ($1, $2, $3) RETURNING admin_id, name, email`,
      [name, email, hashedPassword]
    );

    const token = jwt.sign(
      { id: result.rows[0].admin_id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      status: "success",
      token,
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Admin registration failed" });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await query("SELECT * FROM admin WHERE email = $1", [email]);

    if (
      !result.rows[0] ||
      !(await bcrypt.compare(password, result.rows[0].password))
    ) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: result.rows[0].admin_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      status: "success",
      token,
      data: {
        id: result.rows[0].admin_id,
        name: result.rows[0].name,
        email: result.rows[0].email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};
