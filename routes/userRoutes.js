import express from "express";
import helmet from "helmet";
import cors from "cors";
import {
  register,
  login,
  getProfile,
  updateProfile,
} from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  validateUser,
  validateLogin,
  validateProfileUpdate,
  validateRequest,
  sanitizeInput,
} from "../middlewares/validationMiddleware.js";

const router = express.Router();

// Security middleware
router.use(helmet());
router.use(cors());
router.use(express.json());
router.use(sanitizeInput);

// Public routes
router.post("/register", validateUser, validateRequest, register);
router.post("/login", validateLogin, validateRequest, login);

// Protected routes
router.use(authMiddleware);

// User routes
router.get("/profile", getProfile);
router.put("/profile", validateProfileUpdate, validateRequest, updateProfile);

export default router;
