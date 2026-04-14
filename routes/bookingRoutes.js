const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const bookingController = require("../controllers/bookingController");
const router = express.Router();

const { createBooking, getBookings, getBooking, updateBooking, deleteBooking } =
  bookingController;

//   create booking
router.post("/",protect, createBooking);

// get all bookings
router.get("/", protect, admin, getBookings);

// get booking
router.get("/:id",protect, getBooking);

// update booking
router.put("/:id",protect, updateBooking);

// delete booking
router.delete("/:id",protect, deleteBooking);

module.exports = router;
