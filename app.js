import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";

import userRoutes from "./routes/userRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

// Load environment variables
dotenv.config();

// Initialize express
const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add protocol handling
app.enable('trust proxy');

// Redirect HTTP to HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.secure) {
      next();
    } else {
      res.redirect(`https://${req.headers.host}${req.url}`);
    }
  });
}

// API Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/todos", todoRoutes);
app.use("/api/v1/admin", adminRoutes); // Add admin routes

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use(errorHandler);

// Error handler for SSL/TLS errors
app.use((err, req, res, next) => {
  if (err.code === 'EPROTO') {
    return res.status(502).json({
      error: 'SSL/TLS Protocol Error',
      message: 'Please check if you are using the correct protocol (http/https)',
      development: process.env.NODE_ENV === 'development' 
        ? 'For local development, use http://localhost:5000' 
        : undefined
    });
  }
  next(err);
});

// Start server
const PORT = process.env.PORT || 5000;

// Only start server if this file is run directly
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
