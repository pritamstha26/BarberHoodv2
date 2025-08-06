import express from "express";
import {
  getServices,
  getAllServices,
  addService,
  getServiceById,
  updateServiceById,
  deleteServiceById,
} from "../controllers/servicesController.js";
const router = express.Router();
// Route for user registration
router.post("/", addService); // Route to add a new service
router.get("/", getServices); // Route to get all services
router.get("/all", getAllServices); // Route to get all services
router.get("/:id", getServiceById); // Route to get a service by
router.put("/:id", updateServiceById); // Route to update a service by ID
router.delete("/:id", deleteServiceById); // Route to delete a service by ID
export default router;
