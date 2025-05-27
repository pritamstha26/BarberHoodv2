import { Router } from "express";
import {
  createBarber,
  deleteBarber,
  getABarber,
  getBarbers,
  updateBarber,
} from "../controllers/barberController.js";

const router = Router();
router.get("/barber/", getBarbers);
router.get("/barber/:id", getABarber);
router.post("/barber/", createBarber);
router.put("/barber/:id", updateBarber);
router.delete("/barber/:id", deleteBarber);

export default router;
