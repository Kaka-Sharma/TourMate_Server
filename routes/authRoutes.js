const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

const { register, login, logout} = authController;

//register
router.post("/register", register)

// login
router.post("/login", login)

// logout
router.post("/logout", logout)

module.exports = router