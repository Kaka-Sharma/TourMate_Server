const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const asyncHandler = require("../middleware/asyncHandler")
const AppError = require("../utils/AppError")

// Generate jwt token
const generateToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Register User
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, avatar, role } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return next(new AppError("User already exists", 400))
  }

  if (!password || password.length < 6) {
    return next(new AppError("Password must contains at least 6 characters", 400))
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  //  create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    avatar,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: user,
  });

})

// Login
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(new AppError("Invalid email or password", 401));
  }

  const token = generateToken(user._id);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    data: user,
  });
});

const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

module.exports = { register, login, logout };
