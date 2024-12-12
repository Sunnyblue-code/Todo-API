import User from "../models/User.js";
import { hashPassword, comparePasswords } from "../utils/passwordUtils.js";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || "24h" }
  );
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user with role (default to 'user' if not specified)
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error registering user",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", { email });

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }
    console.log("User found:", { userId: user._id, role: user.role });

    // Check password
    const isPasswordValid = await comparePasswords(password, user.password);
    console.log("Password validation:", { isValid: isPasswordValid });

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    // Generate token with debugging
    const tokenPayload = { userId: user._id, role: user.role };
    console.log("Token payload:", tokenPayload);
    const token = generateToken(user);
    console.log("Token generated successfully");

    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      status: "error",
      message: "Error during login",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Profile not found",
      });
    }
    res.status(200).json({
      status: "success",
      message: "Profile retrieved successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error retrieving profile",
      error: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    // Only include fields that are actually present in the request
    const updates = Object.keys(req.body).reduce((acc, key) => {
      if (req.body[key] !== undefined && ["name", "email"].includes(key)) {
        acc[key] = req.body[key];
      }
      return acc;
    }, {});

    // Check if there are any valid fields to update
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No valid update fields provided",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
      context: "query",
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating profile",
      error: error.message,
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      status: "success",
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error retrieving users",
      error: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
    res.status(200).json({
      status: "success",
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error retrieving user",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating user",
      error: error.message,
    });
  }
};
