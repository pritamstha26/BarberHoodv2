import express from 'express';
import {
  createAppointment,
  getAllAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentById,
  getAppointmentsByBarberId,
  getAppointmentsByClientId,
  confirmAppointment,
  cancelAppointment,
  completeAppointment
} from '../controllers/appointmentController.js';

const router = express.Router();

router.post('/', createAppointment);

router.get('/all', getAllAppointment);
router.get('/barber/:barberId', getAppointmentsByBarberId);
router.get('/client/:clientId', getAppointmentsByClientId);
router.get('/:id', getAppointmentById);

router.put('/:id', updateAppointment);
router.put('/:id/confirm', confirmAppointment);
router.put('/:id/cancel', cancelAppointment);
router.put('/:id/complete', completeAppointment);

router.delete('/:id', deleteAppointment);
export default router;
