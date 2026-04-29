const Booking = require("../models/Booking");
const Tour = require("../models/Tour");

const asyncHandler = require('../middleware/asyncHandler')
const AppError = require('../utils/AppError')

// create booking
const createBooking = asyncHandler(async (req, res, next) => {

  const { tour, guests } = req.body;
  if (!tour || !guests) {
    return next(new AppError("Tour and guests are required", 400));

  }

  if (guests < 1) {
    return next(new AppError("Guests must be at least 1", 400));
  }

  const existingBooking = await Booking.findOne({
    user: req.user.id,
    tour: tour,
  });
  if (existingBooking) {
    return next(new AppError("You have already booked this tour", 400));

  }
  // check tour
  const tourData = await Tour.findById(tour);
  if (!tourData) {
    return next(new AppError("Tour not found", 404));

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
})

// get all bookings (admin)
const getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find()
    .populate("user", "name email")
    .populate("tour", "title price");

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});


// get single booking
const getBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate("user", "name email")
    .populate("tour", "title price");

  if (!booking) {
    return next(new AppError("Booking not found", 404));
  }

  res.status(200).json({
    success: true,
    data: booking,
  });
});

// get my booking
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id }).populate(
    "tour",
    "title price images"
  );

  res.status(200).json({
    success: true,
    data: bookings,
  });
});

// approve booking
const approveBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status: "approved" },
    { new: true }
  )
    .populate("user", "name email")
    .populate("tour", "title price");

  if (!booking) {
    return next(new AppError("Booking not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Booking approved",
    data: booking,
  });
});

// reject booking
const rejectBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status: "rejected" },
    { new: true }
  )
    .populate("user", "name email")
    .populate("tour", "title price");

  if (!booking) {
    return next(new AppError("Booking not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Booking rejected",
    data: booking,
  });
});

// Complete booking
const completeBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate("user", "name email")
    .populate("tour", "title price");

  if (!booking) {
    return next(new AppError("Booking not found", 404));
  }

  if (booking.status !== "approved") {
    return next(
      new AppError("Only approved bookings can be completed", 400)
    );
  }

  booking.status = "completed";
  await booking.save();

  res.status(200).json({
    success: true,
    data: booking,
  });
});

// update booking
const updateBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError("Booking not found", 404));
  }

  if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new AppError("Not authorized to update this booking", 403)
    );
  }

  if (booking.status !== "pending") {
    return next(
      new AppError("Cannot modify booking after approval", 400)
    );
  }

  const { guests } = req.body;

  const tour = await Tour.findById(booking.tour);
  const totalPrice = guests * tour.price;

  const updatedBooking = await Booking.findByIdAndUpdate(
    req.params.id,
    { guests, totalPrice },
    { new: true, runValidators: true }
  )
    .populate("user", "name email")
    .populate("tour", "title price");

  res.status(200).json({
    success: true,
    data: updatedBooking,
  });
});


// Delete Booking
const deleteBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError("Booking not found", 404));
  }

  if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new AppError("Not authorized to delete this booking", 403)
    );
  }

  if (
    booking.status !== "rejected" &&
    booking.status !== "completed"
  ) {
    return next(
      new AppError(
        "Only rejected or completed bookings can be deleted",
        400
      )
    );
  }

  await booking.deleteOne();

  res.status(200).json({
    success: true,
    message: "Booking deleted successfully",
  });
});

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
