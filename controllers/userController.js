const User = require("../models/User");
const cloudinary = require("../utils/cloudinary");
const bcrypt = require("bcrypt");

const { streamUpload, deleteImage } = cloudinary;

// create user (admin)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, avatar } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const hashedPassword = await bcrypt(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      avatar,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all users (admin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single user (admin)
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get user by profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// update profile
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    let updateData = { name, email };

    if (req.file) {
      // Delete old avatar if exists
      const user = await User.findById(req.user.id);
      if (user.avatarPublicId) await deleteImage(user.avatarPublicId);

      // Upload new avatar
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Remove profile picture
const removeProfileAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (user.avatarPublicId) await deleteImage(user.avatarPublicId);

    user.avatar = undefined;
    user.avatarPublicId = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile picture removed",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// update user (admin)
const updateUser = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, avatar },
      {
        new: true,
        runValidators: true,
      },
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete user (admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id).select(
      "-password",
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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
