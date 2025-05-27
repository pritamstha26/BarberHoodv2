import { query } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerClient = async (req, res) => {
  try {
    const { email, password, number, address } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO clients ( email, password, number,address) 
       VALUES ($1, $2, $3, $4) RETURNING client_id, email, number,address`,
      [email, hashedPassword, number, address]
    );

    const token = jwt.sign(
      { id: result.rows[0].client_id },
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
    res.status(400).json({ message: "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    // Validate input
    if (!email || !password || !userType) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let tableName;
    switch (userType) {
      case "admin":
        tableName = "admins";
        break;
      case "barber":
        tableName = "barbers";
        break;
      case "client":
        tableName = "clients";
        break;
      default:
        return res.status(400).json({ message: "Invalid user type" });
    }

    // Query the appropriate table
    const result = await query(`SELECT * FROM ${tableName} WHERE email = $1`, [
      email,
    ]);

    if (
      !result.rows[0] ||
      !(await bcrypt.compare(password, result.rows[0].password))
    ) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];
    const token = jwt.sign(
      {
        id: user.id || user.client_id || user.barber_id || user.admin_id,
        role: userType,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      status: "success",
      token,
      userType,
      data: {
        id: user.id || user.client_id || user.barber_id || user.admin_id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};

export const loginClient = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields ( email, password) are required",
      });
    }
    // 1. Find client by email
    const result = await query("SELECT * FROM clients WHERE email = $1", [
      email,
    ]);

    // 2. Check if clients exists
    if (result.rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    const client = result.rows[0];

    // 3. Verify password
    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // 4. Generate JWT token
    const token = jwt.sign(
      {
        id: client.client_id,
        email: client.email,
        role: "client",
        // status: c.status,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    // 5. Prepare response data (exclude password)
    const clientData = {
      id: client.client_id,
      name: client.name,
      email: client.email,
      number: client.number,
      // status: barber.status,
    };

    // 6. Send success response
    res.status(200).json({
      status: "success",
      token,
      client: clientData,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
