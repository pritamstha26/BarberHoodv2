import { query } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerBarber = async (req, res) => {
  try {
    // need to check if barber exists

    const { email, password, number } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);

    if (!email || !password || !number) {
      return res.status(400).json({
        message: "All fields ( email, password, number) are required",
      });
    }

    const barberStatus = "free";

    const result = await query(
      `INSERT INTO barber ( email, password,number,status) 
       VALUES ($1, $2, $3,$4) RETURNING barber_id, email,number,status`,
      [email, hashedPassword, number, barberStatus]
    );

    const token = jwt.sign(
      { id: result.rows[0].barber_id, role: "barber" },
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
    res.status(400).json({ message: "Barber registration failed" });
  }
};

export const loginBarber = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields ( email, password) are required",
      });
    }
    // 1. Find barber by email
    const result = await query("SELECT * FROM barber WHERE email = $1", [
      email,
    ]);

    // 2. Check if barber exists
    if (result.rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    const barber = result.rows[0];

    // 3. Verify password
    const isMatch = await bcrypt.compare(password, barber.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // 4. Generate JWT token
    const token = jwt.sign(
      {
        id: barber.barber_id,
        email: barber.email,
        role: "barber",
        status: barber.status,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    // 5. Prepare response data (exclude password)
    const barberData = {
      id: barber.barber_id,
      name: barber.name,
      email: barber.email,
      number: barber.number,
      status: barber.status,
    };

    // 6. Send success response
    res.status(200).json({
      status: "success",
      token,
      barber: barberData,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const getBarbers = async (req, res) => {
  try {
    const { email, number } = req.query;
    let sql = `SELECT * FROM barber WHERE 1=1`;
    const params = [];
    if (email) {
      sql += ` AND email ILIKE $` + (params.length + 1);
      params.push(`%${email}%`);
    }

    if (number) {
      sql += ` AND number =$` + (params.length + 1);
      params.push(number);
    }
    sql += ` ORDER BY email`;
    const { rows } = await query(sql, params);
    if (rows.length === 0) {
      res.status(404).json({ message: "No barber found" });
    }
    res.status(200).json({ data: rows });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getABarber = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await query(
      `SELECT barber_id, email, number, status FROM barber where barber_id=$1 `,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Barber not found",
      });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Internal error" });
  }
};

export const createBarber = async (req, res) => {
  try {
    const { name, email, password, number, status } = req.body;

    // check if barber exists
    const checkBarber = await query(`SELECT *  FROM barber where email = $1`, [
      email,
    ]);
    if (checkBarber.rows.length > 0) {
      return res.status(400).json({ message: "Email already exist" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await query(
      "INSERT INTO barber (name, email, password, number, status) VALUES ($1, $2, $3, $4, $5) RETURNING barber_id, name, email, number, status",
      [name, email, hashedPassword, number, status || "free"]
    );

    res.status(201).json({
      status: "success",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(400).json({
      message: "An error occured",
    });
  }
};

export const deleteBarber = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const result = await query(`SELECT * FROM barber where barber_id  =$1`, [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Barber not found",
      });
    }

    await query(`DELETE FROM barber where barber_id =$1`, [id]);

    res.status(201).json({
      status: "success",
      message: " Barber deletion successful",
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Barber deletion  failed" });
  }
};

export const updateBarber = async (req, res) => {
  const id = parseInt(req.params.id);
  const { email, number, name, password, status } = req.body;
  try {
    const barberCheck = await query(
      `SELECT * FROM barber where barber_id  =$1 `,
      [id]
    );
    if (barberCheck.rows.length === 0) {
      return res.status(404).json({ message: "No barber found" });
    }
    // does email exists
    if (email && email !== barberCheck.rows[0].email) {
      const emailCheck = await query(
        "SELECT * FROM barber WHERE email = $1 AND barber_id != $2",
        [email, id]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }
    let updateQuery = `UPDATE barber SET `;
    const updateValues = [];
    let valueIndex = 1;
    if (name) {
      updateQuery += `name = $${valueIndex}, `;
      updateValues.push(name);
      valueIndex++;
    }
    if (email) {
      updateQuery += `email =$${valueIndex}, `;
      updateValues.push(email);
      valueIndex++;
    }
    if (number) {
      updateQuery += `number =$${valueIndex}, `;
      updateValues.push(number);
      valueIndex++;
    }
    if (status) {
      updateQuery += `status =$${valueIndex}, `;
      updateValues.push(status);
      valueIndex++;
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      updateQuery += `password = $${valueIndex}, `;
      updateValues.push(hashedPassword);
      valueIndex++;
    }

    // removing last comma and space
    updateQuery = updateQuery.slice(0, -2);
    // adding where clause

    updateQuery += ` WHERE barber_id =$${valueIndex}  RETURNING *`;
    updateValues.push(id);

    const result = await query(updateQuery, updateValues);
    res.json({ message: "Barber updated successfully", data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
