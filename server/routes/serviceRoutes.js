import { Router } from "express";
import {
  addService,
  deleteService,
  getAllServices,
  updateService,
} from "../controllers/serviceController.js";

const router = Router();

router.get("/", getAllServices);
router.post("/", addService);
router.delete("/services/:id", deleteService);
router.put("/services/:id", updateService);

export default router;
