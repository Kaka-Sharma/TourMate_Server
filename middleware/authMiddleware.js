const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes
const protect = async (req, res, next) => {
  try {
    let token;

    // check cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // if token exists in header
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // get token from header
      token = req.headers.authorization.split(" ")[1];
    }

    // if token not found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    // verify token
    const decode = jwt.verify(token, process.env.JWT_SECRET);

    // find user from token id
    const user = await User.findById(decode.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;

    next(); // move to next middleware/controller
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { protect };
