import express from "express";
import {
  getBarberServices,
  deleteBarberService,
  updateBarberService,
  addBarberService,
} from "../controllers/barberServiceController.js";
const router = express.Router();

// Route to get all barber services
router.get("/all", getBarberServices);
// Route to delete a barber service by ID
router.delete("/:id", deleteBarberService);
// Route to update a barber service by ID
router.put("/:id", updateBarberService);
// Route to add a new barber service
router.post("/", addBarberService);
export default router;
