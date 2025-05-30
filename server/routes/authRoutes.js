import express from "express";
import { login, register } from "../controllers/authController.js";
const router = express.Router();
// Route for user registration
router.post("/register", register);
router.post("/login", login); // Route for user login
export default router;
