import Todo from "../models/Todo.js";

// Create new todo
export const createTodo = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    const todo = new Todo({
      title,
      description,
      dueDate,
      userId: req.user.userId, // from auth middleware
    });
    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all todos for a user with filters
export const getTodos = async (req, res) => {
  try {
    const { completed, sortBy = "dueDate" } = req.query;
    const query = { userId: req.user.userId };

    if (completed !== undefined) {
      query.completed = completed === "true";
    }

    const todos = await Todo.find(query)
      .sort({ [sortBy]: 1, createdAt: -1 })
      .populate("userId", "name email");

    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get todo by ID
export const getTodoById = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update todo
export const updateTodo = async (req, res) => {
  try {
    const { title, description, dueDate, completed } = req.body;
    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    if (title) todo.title = title;
    if (description) todo.description = description;
    if (dueDate) todo.dueDate = dueDate;
    if (completed !== undefined) todo.completed = completed;

    await todo.save();
    res.status(200).json(todo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete todo
export const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle todo completion status
export const toggleTodoStatus = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    todo.completed = !todo.completed;
    await todo.save();

    res.status(200).json(todo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all completed todos
export const getCompletedTodos = async (req, res) => {
  try {
    const todos = await Todo.find({
      userId: req.user.userId,
      completed: true,
    });
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get todos by due date range
export const getTodosByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const todos = await Todo.find({
      userId: req.user.userId,
      dueDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).sort({ dueDate: 1 });

    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
