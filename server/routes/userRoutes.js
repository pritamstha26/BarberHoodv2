import {
  getUserById,
  getUsers,
  updateUser,
  deleteUser,
  updateRestaurateurCapacity,
  getRestaurateurCapacity,
} from "../controllers/clientController.js";
import express from "express";

const router = express.Router();

router.get("/all", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/delete/:id", deleteUser);
router.put("/restaurateur/:id/capacity", updateRestaurateurCapacity);
router.get("/restaurateur/:id/capacity", getRestaurateurCapacity);
export default router;
