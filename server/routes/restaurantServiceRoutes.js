import express from "express";
import {
  getRestaurateursServices,
  deleteRestaurateursService,
  updateRestaurateursService,
  addRestaurateursService,
  getRestaurateursById,
} from "../controllers/restaurantServiceController.js";
const router = express.Router();

// Route to get all restaurateurs services
router.get("/all", getRestaurateursServices);
// Route to delete a Restaurateurs service by ID
router.delete("/:id", deleteRestaurateursService);
// Route to update a Restaurateurs service by ID
router.put("/:id", updateRestaurateursService);
// Route to add a new Restaurateurs service
router.post("/", addRestaurateursService);

router.get("/:id", getRestaurateursById);
export default router;
