import express from "express";
import {
  createAppointment,
  getAllAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentById,
} from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/", createAppointment);

router.get("/all", getAllAppointment);
router.get("/:id", getAppointmentById);

router.put("/:id", updateAppointment);

router.delete("/:id", deleteAppointment);
export default router;
