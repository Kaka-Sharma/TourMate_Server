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
      status: "pending",
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

// approve booking
const approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true },
    )
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
      message: "Booking approved",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// reject booking
const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true },
    )
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
      message: "Booking rejected",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete booking
const completeBooking = async (req, res) => {
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

    if (booking.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved bookings can be completed",
      });
    }

    booking.status = "completed";
    await booking.save();

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

// update booking
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check ownership
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this booking",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Cannot modify booking after approval",
      });
    }

    const { guests } = req.body;

    const tour = await Tour.findById(booking.tour);

    const totalPrice = guests * tour.price;

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { guests, totalPrice },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("user", "name email")
      .populate("tour", "title price");

    res.status(200).json({
      success: true,
      data: updatedBooking,
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
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check ownership (or admin)
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this booking",
      });
    }
    if (booking.status !== "rejected" && booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Only rejected or completed bookings can be deleted",
      });
    }

    await booking.deleteOne();

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
  approveBooking,
  rejectBooking,
  completeBooking,
  updateBooking,
  deleteBooking,
};
