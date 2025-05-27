// import { Router } from 'express';
// import { protect } from '../middlewares/auth.js';
// import {
//   createAppointment,
//   getMyAppointments,
//   cancelAppointment,
//   getAvailableSlots
// } from '../controllers/appointmentController.js';

// const router = Router();

// // Protect all appointment routes
// router.use(protect);

// router
//   .post('/', createAppointment)
//   .get('/my-appointments', getMyAppointments)
//   .delete('/:id', cancelAppointment)
//   .get('/available-slots', getAvailableSlots);

// export default router;

import express from "express";
import {
  getAppointments,
  newAppointment,
  cancelAppointment,
  getAppointment,
} from "../controllers/appointmentController.js";

const router = express.Router();

// POST endpoint to book an appointment
router.post("/appointments", newAppointment);
router.get("/appointments", getAppointments);
router.put("/appointments/:id", cancelAppointment);
router.get("/appointments/:id", getAppointment);

export default router;
