import express from "express";
import { getServices, addService } from "../controllers/servicesController.js";
const router = express.Router();
// Route for user registration
router.post("/", addService); // Route to add a new service
router.get("/", getServices); // Route to get all services
export default router;
