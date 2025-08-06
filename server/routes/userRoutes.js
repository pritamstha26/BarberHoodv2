import {
  getUserById,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/clientController.js";
import express from "express";

const router = express.Router();

router.get("/all", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/delete/:id", deleteUser);
export default router;
