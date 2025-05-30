import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import sequelize from "./config/db.js"; // Import sequelize instance
//
dotenv.config();
const app = express();

await sequelize.sync({ alter: true });

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
// app.use("/api/users", userRoutes); // Assuming authRoutes handles user-related routes
//
// app.use("/api/services", serviceRoutes);
// app.use("/api/barber", barberRoutes);
// app.use("/api/appointment", appointmentRoutes);
// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB()
    .then(() => console.log("Database connected"))
    .catch((err) => console.error("Database connection error:", err));
});
