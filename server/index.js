import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import RestaurantRoutes from "./routes/restaurantServiceRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import sequelize from "./config/db.js";
dotenv.config();
const app = express();

const addPostgresEnumValue = async (enumType, value) => {
  try {
    await sequelize.query(`
      DO $$
      DECLARE
        resolved_type_name text;
      BEGIN
        SELECT typname INTO resolved_type_name
        FROM pg_type
        WHERE lower(typname) = lower('${enumType}')
        LIMIT 1;

        IF resolved_type_name IS NOT NULL THEN
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum
            WHERE enumtypid = resolved_type_name::regtype
              AND enumlabel = '${value}'
          ) THEN
            EXECUTE format(
              'ALTER TYPE %I ADD VALUE %L',
              resolved_type_name,
              '${value}',
            );
          END IF;
        END IF;
      END
      $$;
    `);
  } catch (error) {
    console.warn(
      `Could not ensure enum value ${value} on ${enumType}:`,
      error.message,
    );
  }
};

try {
  // Ensure the appointment status enum includes all supported values before syncing.
  await addPostgresEnumValue("enum_AppointmentModels_status", "in_progress");
  await addPostgresEnumValue("enum_AppointmentModels_status", "completed");

  // Attempt to sync models to DB in dev, but don't crash the app on failure.
  await sequelize.sync({ alter: true });
} catch (syncErr) {
  console.warn(
    "Sequelize sync (alter) failed. This can happen when the DB schema diverges from models. Skipping sync; please run migrations instead.",
    syncErr.message || syncErr,
  );
}
// Middleware
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
// Allow the default Vite port and a common fallback (5174) used when 5173 is occupied
const allowedOrigins = [
  FRONTEND_URL,
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/restaurateurs-services", RestaurantRoutes);
app.use("/api/location", locationRoutes);
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
