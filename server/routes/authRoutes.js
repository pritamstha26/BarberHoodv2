import { Router } from "express";
import { protect } from "../middlewares/auth.js"; // Add .js extension
import { loginClient, registerClient } from "../controllers/authController.js"; // Also add .js here if using ES modules
import { loginAdmin, registerAdmin } from "../controllers/adminController.js";
import {
  registerBarber,
  loginBarber,
} from "../controllers/barberController.js";
const router = Router();

// router.use(protect);
// client routes
router.post("/register/client", registerClient);
router.post("/login/client", loginClient);
// admin routes
router.post("/register/admin", registerAdmin);
router.post("/login/admin", loginAdmin);
// barber routes
router.post("/register/barber", registerBarber);
router.post("/login/barber", loginBarber);

export default router;
