import Todo from "../models/Todo.js";
import User from "../models/User.js";

// Get all todos (admin only)
export const getAllTodos = async (req, res) => {
  try {
    const todos = await Todo.find().populate("userId", "name email");
    res.status(200).json({
      status: "success",
      data: todos,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get system statistics
export const getStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const todoCount = await Todo.countDocuments();
    const completedTodoCount = await Todo.countDocuments({ completed: true });

    res.status(200).json({
      status: "success",
      data: {
        users: userCount,
        todos: todoCount,
        completedTodos: completedTodoCount,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
