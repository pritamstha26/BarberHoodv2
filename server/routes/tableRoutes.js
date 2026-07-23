import express from "express";
import {
  getRestaurantTables,
  createTable,
  updateTable,
  deleteTable,
  getAllTables,
} from "../controllers/tableController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/restaurant/:restaurateurId", getRestaurantTables);
router.get("/all", getAllTables);
router.post("/", (req, res, next) => {
  console.log("[tables] create body:", req.body);
  console.log("[tables] auth:", req.headers.authorization || "none");
  next();
}, createTable);
router.put("/:id", updateTable);
router.delete("/:id", deleteTable);

export default router;