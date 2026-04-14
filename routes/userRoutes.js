const express = require("express");
const upload = require("../utils/upload");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const router = express.Router();
const userController = require("../controllers/userController");

const {
  createUser,
  getUsers,
  getUser,
  getProfile,
  updateProfile,
  removeProfileAvatar,
  updateUser,
  deleteUser,
} = userController;
// create user
router.post("/", protect, admin, createUser);

// get users
router.get("/", protect, admin, getUsers);

// get profile
router.get("/profile", protect, getProfile);

// update profile
router.put("/profile", protect, upload.single("avatar"), updateProfile);

// remove profile picture
router.delete("/profile/avatar", protect, removeProfileAvatar);

// get user
router.get("/:id", protect, admin, getUser);

// update user
router.put("/:id", protect, admin, updateUser);

// delete user
router.delete("/:id", protect, admin, deleteUser);

module.exports = router;
