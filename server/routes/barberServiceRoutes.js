import express from 'express';
import {
  getBarberServices,
  deleteBarberService,
  updateBarberService,
  addBarberService,
  getBarberById
} from '../controllers/barberServiceController.js';
const router = express.Router();

// Route to get all barber services
router.get('/all', getBarberServices);
// Route to delete a barber service by ID
router.delete('/:id', deleteBarberService);
// Route to update a barber service by ID
router.put('/:id', updateBarberService);
// Route to add a new barber service
router.post('/', addBarberService);

router.get('/:id', getBarberById);
export default router;
