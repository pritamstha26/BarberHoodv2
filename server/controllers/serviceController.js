import { query } from "../config/db.js";

export const getAllServices = async (req, res) => {
  try {
    const result = await query(`SELECT  * FROM services ORDER BY name`);

    res.status(200).json({
      data: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch services" });
  }
};

export const addService = async (req, res) => {
  try {
    const { name, price, duration } = req.body;

    if (!name || !price || !duration) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const result = await query(
      `INSERT INTO services (name, price,duration) 
         VALUES ($1, $2 , $3) RETURNING *`,
      [name, price, duration]
    );

    res.status(201).json({
      status: "success",
      message: "Service added successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error adding service:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      "DELETE FROM services WHERE service_id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.status(201).json({
      status: "success",
      message: "Service deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error adding service:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, price } = req.body;

    // Check if service exists
    const check = await query(`SELECT * FROM services WHERE service_id = $1`, [
      id,
    ]);
    if (check.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Service not found",
      });
    }

    // Perform update
    await query(
      `UPDATE services SET name = $1, price = $2 WHERE service_id = $3`,
      [name, price, id]
    );

    res.status(200).json({
      status: "success",
      message: "Service updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Service update failed" });
  }
};
