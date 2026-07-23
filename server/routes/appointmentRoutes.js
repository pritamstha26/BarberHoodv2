import express from "express";
import {
  createAppointment,
  getAllAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentById,
  getAppointmentsBybarbarId,
  getAppointmentsByClientId,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  extendAppointment,
} from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/", createAppointment);

// Administrative and data fetching endpoints
router.get("/all", getAllAppointment);
router.get("/restaurateurs/:restaurateurId", getAppointmentsBybarbarId);
router.get("/client/:clientId", getAppointmentsByClientId);
router.get("/:id", getAppointmentById);

// Status transitions and modifications
router.put("/:id", updateAppointment);
router.put("/:id/confirm", confirmAppointment);
router.put("/:id/cancel", cancelAppointment);
router.put("/:id/complete", completeAppointment);
router.post("/:id/extend", extendAppointment);

// Deletions
router.delete("/:id", deleteAppointment);

export default router;
