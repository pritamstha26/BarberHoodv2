import { query } from "../config/db.js";
import pool from "../config/db.js";
// Create new appointment

export const newAppointment = async (req, res) => {
  const {
    client_id,
    barber_id,
    appoint_date,
    start_time,
    service_ids = req.body.service_id,
  } = req.body;

  try {
    // Input validation
    if (
      !client_id ||
      !barber_id ||
      !appoint_date ||
      !start_time ||
      !service_ids?.length
    ) {
      return res
        .status(400)
        .json({ message: "All fields are required", received: req.body });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(appoint_date)) {
      return res
        .status(400)
        .json({ message: "Invalid date format (use YYYY-MM-DD)" });
    }

    if (!/^\d{2}:\d{2}:\d{2}$/.test(start_time)) {
      return res
        .status(400)
        .json({ message: "Invalid time format (use HH:MM:SS)" });
    }

    const appointDateTime = new Date(`${appoint_date}T${start_time}+05:45`);
    const now = new Date("2025-05-15T01:19:00+05:45");
    if (appointDateTime <= now) {
      return res
        .status(400)
        .json({ message: "Appointment must be in the future" });
    }

    // Validate barber exists
    const barberCheck = await query(
      "SELECT * FROM barber WHERE barber_id = $1",
      [barber_id]
    );
    if (barberCheck.rows.length === 0) {
      return res.status(400).json({ message: "Barber not found" });
    }

    // Validate client
    const clientCheck = await query(
      "SELECT * FROM clients WHERE client_id = $1",
      [client_id]
    );
    if (clientCheck.rows.length === 0) {
      return res.status(400).json({ message: "Client not found" });
    }

    // Validate services and calculate duration/price
    const services = await query(
      "SELECT service_id, duration, price FROM services WHERE service_id = ANY($1)",
      [service_ids]
    );
    if (services.rows.length !== service_ids.length) {
      return res
        .status(400)
        .json({ message: "One or more service IDs are invalid" });
    }
    const totalDuration = services.rows.reduce((sum, s) => sum + s.duration, 0);
    const totalPrice = services.rows.reduce(
      (sum, s) => sum + parseFloat(s.price),
      0
    );

    // Calculate end time
    const [hours, minutes, seconds] = start_time.split(":").map(Number);
    const endTime = new Date();
    endTime.setHours(hours, minutes + totalDuration, seconds);
    const endTimeStr = endTime.toTimeString().split(" ")[0];

    // Check for overlapping appointments (exclude cancelled)
    const overlapCheck = await query(
      `SELECT appoint_id 
       FROM appointment 
       WHERE barber_id = $1 
       AND appoint_date = $2 
       AND status = 'pending'
       AND (
         (start_time <= $3 AND end_time > $3) OR 
         (start_time < $4 AND end_time >= $4) OR 
         (start_time >= $3 AND end_time <= $4)
       )`,
      [barber_id, appoint_date, start_time, endTimeStr]
    );
    if (overlapCheck.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Barber is busy during the requested time slot" });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Insert appointment
      const appointResult = await client.query(
        `INSERT INTO appointment (client_id, barber_id, status, appoint_date, start_time, end_time)
         VALUES ($1, $2, 'pending', $3, $4, $5) RETURNING appoint_id`,
        [client_id, barber_id, appoint_date, start_time, endTimeStr]
      );
      const appoint_id = appointResult.rows[0].appoint_id;

      // Insert appointment-services links
      for (const service_id of service_ids) {
        await client.query(
          "INSERT INTO appointment_services (appoint_id, service_id) VALUES ($1, $2)",
          [appoint_id, service_id]
        );
      }

      // Update barber status to busy
      await client.query(
        "UPDATE barber SET status = 'busy' WHERE barber_id = $1",
        [barber_id]
      );

      await client.query("COMMIT");
      res
        .status(201)
        .json({ message: "Appointment booked", appoint_id, totalPrice });
    } catch (err) {
      console.error("Transaction error:", err.message, err.stack);
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error in newAppointment:", err.message, err.stack);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const cancelAppointment = async (req, res) => {
  const { client_id } = req.body;
  const appoint_id = parseInt(req.params.id);

  try {
    // Validate inputs
    if (!client_id || isNaN(appoint_id)) {
      return res
        .status(400)
        .json({ message: "client_id and appoint_id are required" });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Check if appointment exists and belongs to client
      const appointCheck = await client.query(
        `SELECT barber_id, appoint_date, status 
         FROM appointment 
         WHERE appoint_id = $1 AND client_id = $2`,
        [appoint_id, client_id]
      );

      if (appointCheck.rows.length === 0) {
        await client.query("ROLLBACK");
        return res
          .status(404)
          .json({ message: "Appointment not found or not owned by client" });
      }

      const { barber_id, appoint_date, status } = appointCheck.rows[0];

      // Check if appointment is pending
      if (status !== "pending") {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ message: "Only pending appointments can be cancelled" });
      }

      // Update appointment status to cancelled
      await client.query(
        `UPDATE appointment SET status = 'cancelled' WHERE appoint_id = $1`,
        [appoint_id]
      );

      // Check if barber has other pending appointments on the same date
      const otherAppointments = await client.query(
        `SELECT appoint_id 
         FROM appointment 
         WHERE barber_id = $1 
         AND appoint_date = $2 
         AND status = 'pending' 
         AND appoint_id != $3`,
        [barber_id, appoint_date, appoint_id]
      );

      // If no other pending appointments, set barber to free
      if (otherAppointments.rows.length === 0) {
        await client.query(
          `UPDATE barber SET status = 'free' WHERE barber_id = $1`,
          [barber_id]
        );
      }

      await client.query("COMMIT");
      res.status(200).json({ message: "Appointment cancelled", appoint_id });
    } catch (err) {
      console.error(
        "Transaction error in cancelAppointment:",
        err.message,
        err.stack
      );
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error in cancelAppointment:", err.message, err.stack);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const result = await query(`
      SELECT a.appoint_id, a.appoint_date, a.start_time, a.end_time, a.status,
             b.email as barber_email, c.email as client_email,
             ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) as services,
             COALESCE(SUM(s.price), 0) as total_price
      FROM appointment a
      JOIN barber b ON a.barber_id = b.barber_id
      JOIN clients c ON a.client_id = c.client_id
      LEFT JOIN appointment_services asrv ON a.appoint_id = asrv.appoint_id
      LEFT JOIN services s ON asrv.service_id = s.service_id
      GROUP BY a.appoint_id, b.email, c.email
      ORDER BY a.appoint_date, a.start_time
    `);
    res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error("Error in getAppointments:", err.message, err.stack);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAppointment = async (req, res) => {
  const appoint_id = parseInt(req.params.id);

  try {
    if (isNaN(appoint_id)) {
      return res.status(400).json({ message: "Invalid appoint_id" });
    }

    const result = await query(
      `
      SELECT a.appoint_id, a.appoint_date, a.start_time, a.end_time, a.status,
             b.email as barber_email, c.email as client_email,
             ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) as services,
             COALESCE(SUM(s.price), 0) as total_price
      FROM appointment a
      JOIN barber b ON a.barber_id = b.barber_id
      JOIN clients c ON a.client_id = c.client_id
      LEFT JOIN appointment_services asrv ON a.appoint_id = asrv.appoint_id
      LEFT JOIN services s ON asrv.service_id = s.service_id
      WHERE a.appoint_id = $1
      GROUP BY a.appoint_id, b.email, c.email
    `,
      [appoint_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({ data: result.rows[0] });
  } catch (err) {
    console.error("Error in getAppointment:", err.message, err.stack);
    res.status(500).json({ message: "Internal server error" });
  }
};
