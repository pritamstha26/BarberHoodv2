import express from "express";
import {
  submitRating,
  getAverageRating,
  getAppointmentRatings,
} from "../controllers/ratingController.js";

const router = express.Router();

router.post("/", submitRating);
router.get("/average/:type/:userId", getAverageRating);
router.get("/appointment/:appointmentId", getAppointmentRatings);

export default router;
