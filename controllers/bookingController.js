const Booking = require("../models/Booking");
const Tour = require("../models/Tour");

// create booking
const createBooking = async (req, res) => {
  try {
    const { tour, guests } = req.body;
    if (!tour || !guests) {
      return res.status(400).json({
        success: false,
        message: "Tour and guests are required",
      });
    }

    if (guests < 1) {
      return res.status(400).json({
        success: false,
        message: "Guests must be at least 1",
      });
    }
    
    const existingBooking = await Booking.findOne({
      user: req.user.id,
      tour: tour,
    });
    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "You have already booked this tour",
      });
    }
    // check tour
    const tourData = await Tour.findById(tour);
    if (!tourData) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    const tourPrice = tourData.price;
    const totalPrice = tourPrice * guests;

    const booking = await Booking.create({
      user: req.user.id,
      tour,
      guests,
      tourPrice,
      totalPrice,
    });

    res.status(201).json({
      success: true,
      message: "Tour booked successfully",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get all bookings (admin)
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("tour", "title price");

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get single booking
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email")
      .populate("tour", "title price");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get my booking
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate(
      "tour",
      "title price images",
    );

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// update booking
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("user", "name email")
      .populate("tour", "title price");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Booking
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBooking,
  getMyBookings,
  updateBooking,
  deleteBooking,
};
