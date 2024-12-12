import express from "express";
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  getTodoById,
  toggleTodoStatus,
  getCompletedTodos,
  getTodosByDateRange,
} from "../controllers/todoController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  validateTodo,
  validateRequest,
} from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.use(authMiddleware); // Apply auth middleware to all routes

router.get("/", getTodos);
router.post("/", validateTodo, validateRequest, createTodo);
router.put("/:id", validateTodo, validateRequest, updateTodo);
router.delete("/:id", deleteTodo);
router.get("/:id", getTodoById);
router.patch("/:id/toggle", toggleTodoStatus);
router.get("/completed", getCompletedTodos);
router.get("/date-range", getTodosByDateRange);

export default router;
