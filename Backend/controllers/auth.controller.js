const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register new user
const register = async (req, res) => {
  try {
    const { full_name, email, phone, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create new user
    const user = await User.create({
      full_name,
      email,
      phone,
      password,
      role: role || "client",
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          user_id: user._id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          created_at: user.createdAt,
          updated_at: user.updatedAt,
        },
        token,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: {
          role: error.errors.role?.message || null,
          name: error.errors.name?.message || null,
          email: error.errors.email?.message || null,
        },
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);
    console.log(" : ", user);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          user_id: user._id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          verified: user.verified,
          role: user.role,
          created_at: user.createdAt,
          updated_at: user.updatedAt,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get current user profile
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          user_id: user._id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          verified: user.verified,
          created_at: user.createdAt,
          updated_at: user.updatedAt,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// update user profile
const updateProfile = async (req, res) => {
  const { full_name, phone } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { full_name, phone },
    { new: true }
  );
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: {
      user: {
        user_id: user._id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        verified: user.verified,
      },
    },
  });
};

// Update user password
const updatePassword = async (req, res) => {
  const { password, old_password } = req.body;

  // First, get the current user to verify the old password
  const currentUser = await User.findById(req.user._id);
  if (!currentUser) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Verify the old password
  const isOldPasswordValid = await bcrypt.compare(old_password, currentUser.password);
  if (!isOldPasswordValid) {
    return res.status(400).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  // Check if new password is different from old password
  const isNewPasswordSame = await bcrypt.compare(password, currentUser.password);
  if (isNewPasswordSame) {
    return res.status(400).json({
      success: false,
      message: "New password cannot be the same as current password",
    });
  }

  // Hash the new password and update
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { password: hashedPassword },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
    data: {
      user: {
        user_id: user._id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        verified: user.verified,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
      },
    },
  });
};

// Update user profile (works for all user roles)
module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
};
