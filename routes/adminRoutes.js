import express from "express";
import { getAllTodos, getStats } from "../controllers/adminController.js";
import {
  getUsers,
  getUserById,
  updateUser,
} from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";
import {
  validateUser,
  validateRequest,
} from "../middlewares/validationMiddleware.js";

const router = express.Router();

// Protect all admin routes
router.use(authMiddleware);
router.use(isAdmin);

router.get("/todos", getAllTodos);
router.get("/stats", getStats);

// Admin only routes
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", validateUser, validateRequest, updateUser);

export default router;
