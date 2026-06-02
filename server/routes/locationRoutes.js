import express from "express";
import {
  getNearbyRestaurateurs,
  updateUserLocation,
  getCurrentLocation,
  getDistanceToUser,
  debugRestaurateurs,
} from "../controllers/locationController.js";

const router = express.Router();

// Get nearby barbers based on provided coordinates
router.get("/nearby-restaurateurs", getNearbyRestaurateurs);

// Update user's location
router.put("/update", updateUserLocation);

// Get user's current location
router.get("/current", getCurrentLocation);

// Get distance between current user and another user
router.get("/distance/:userId", getDistanceToUser);

// Debug endpoint to check restaurateur locations
router.get("/debug/restaurateurs", debugRestaurateurs);

export default router;
