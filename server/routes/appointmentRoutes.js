import express from "express";
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  // handleAppointmentStatus,
} from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/", createAppointment);

router.get("/all", getAppointments);
router.get("/:id", getAppointmentById);

router.put("/:id", updateAppointment);

router.delete("/:id", deleteAppointment);
// router.patch("/appointments/:id/status", handleAppointmentStatus);
export default router;
