import express from "express";
import { authenticateToken } from "../middlewares/auth.js";
import {
  enterLottery,
  getLotteryStatus,
  getAlternatives,
  manualResolve,
} from "../controllers/lotteryController.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/enter", enterLottery);
router.get("/status", getLotteryStatus);
router.post("/alternatives", getAlternatives);

router.post("/resolve", (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}, manualResolve);

export default router;