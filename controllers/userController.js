const User = require("../models/User");
const cloudinary = require("../utils/cloudinary");
const bcrypt = require("bcrypt");
const asyncHandler = require('../middleware/asyncHandler')
const AppError = require('../utils/AppError')

const { streamUpload, deleteImage } = cloudinary;

// create user (admin)
const createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, avatar } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("User already exists", 400));
  }

  if (!password || password.length < 6) {
    return next(new AppError("Password must be at least 6 characters", 400));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    avatar,
  });

  user.password = undefined;

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: user,
  });
});

// Get all users (admin)
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// Get single user (admin)
const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// get user by profile
const getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// update profile
const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, email } = req.body;
  let updateData = { name, email };

  if (req.file) {
    const user = await User.findById(req.user.id);

    if (user.avatarPublicId) {
      await deleteImage(user.avatarPublicId);
    }

    const result = await streamUpload(req.file.buffer, "profiles");

    updateData.avatar = result.secure_url;
    updateData.avatarPublicId = result.public_id;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: updatedUser,
  });
});

// Remove profile picture
const removeProfileAvatar = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.avatarPublicId) {
    await deleteImage(user.avatarPublicId);
  }

  user.avatar = undefined;
  user.avatarPublicId = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile picture removed",
    data: user,
  });
});

// update user (admin)
const updateUser = asyncHandler(async (req, res, next) => {
  const { name, email, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, avatar },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// Delete user (admin)
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  getProfile,
  updateProfile,
  removeProfileAvatar,
  updateUser,
  deleteUser,
};
