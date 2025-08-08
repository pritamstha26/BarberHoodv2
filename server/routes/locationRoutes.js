import express from 'express';
import {
  getNearbyBarbers,
  updateUserLocation,
  getCurrentLocation,
  getDistanceToUser
} from '../controllers/locationController.js';

const router = express.Router();

// Get nearby barbers based on provided coordinates
router.get('/nearby-barbers', getNearbyBarbers);

// Update user's location
router.put('/update', updateUserLocation);

// Get user's current location
router.get('/current', getCurrentLocation);

// Get distance between current user and another user
router.get('/distance/:userId', getDistanceToUser);

export default router;
