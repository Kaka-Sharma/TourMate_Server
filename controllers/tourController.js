const Tour = require("../models/Tour");
const cloudinary = require("../utils/cloudinary");

const asyncHandler = require('../middleware/asyncHandler')
const AppError = require('../utils/AppError')

const { streamUpload, deleteImage } = cloudinary;

// create Tour (admin)
const createTour = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    location,
    price,
    duration,
    maxGroupSize,
    difficulty,
    ratingAverage,
    ratingsQuantity,
    isPopular,
  } = req.body;

  let images = [];

  if (req.files && req.files.length > 0) {
    const results = await Promise.all(
      req.files.map((file) => streamUpload(file.buffer, "tours"))
    );

    images = results.map((result) => ({
      url: result.secure_url,
      public_id: result.public_id,
    }));
  }

  const tour = await Tour.create({
    title,
    description,
    location,
    price,
    duration,
    maxGroupSize,
    difficulty,
    ratingAverage,
    ratingsQuantity,
    images,
    isPopular: isPopular === "true",
    createdBy: req.user?.id || null,
  });

  res.status(201).json({
    success: true,
    message: "Tour created successfully",
    data: tour,
  });
});

// Get all Tours
const getTours = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 9 } = req.query;

  let query = {};

  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  const skip = (page - 1) * limit;

  const total = await Tour.countDocuments(query);

  const tours = await Tour.find(query)
    .populate("createdBy", "name email")
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: tours.length,
    total,
    currentPage: Number(page),
    totalPages: Math.ceil(total / limit),
    data: tours,
  });
});

// Get single tour
const getTour = asyncHandler(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate(
    "createdBy",
    "name email"
  );

  if (!tour) {
    return next(new AppError("Tour not found", 404));
  }

  res.status(200).json({
    success: true,
    data: tour,
  });
});

// get Popular tour
const getPopularTours = asyncHandler(async (req, res) => {
  const { page = 1, limit = 8 } = req.query;

  const skip = (page - 1) * limit;

  const total = await Tour.countDocuments({ isPopular: true });

  const tours = await Tour.find({ isPopular: true })
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: tours.length,
    total,
    currentPage: Number(page),
    totalPages: Math.ceil(total / limit),
    data: tours,
  });
});

// toggle popularity
const togglePopular = asyncHandler(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError("Tour not found", 404));
  }

  tour.isPopular = !tour.isPopular;
  await tour.save();

  res.status(200).json({
    success: true,
    message: "Popularity updated",
    data: tour,
  });
});

// Update tour (admin)
const updateTour = asyncHandler(async (req, res, next) => {
  let updateData = { ...req.body };

  if (req.body.isPopular !== undefined) {
    updateData.isPopular = req.body.isPopular === "true";
  }

  if (req.files && req.files.length > 0) {
    const existingTour = await Tour.findById(req.params.id);

    if (!existingTour) {
      return next(new AppError("Tour not found", 404));
    }

    if (existingTour.images.length > 0) {
      await Promise.all(
        existingTour.images.map((img) => deleteImage(img.public_id))
      );
    }

    const results = await Promise.all(
      req.files.map((file) => streamUpload(file.buffer, "tours"))
    );

    updateData.images = results.map((result) => ({
      url: result.secure_url,
      public_id: result.public_id,
    }));
  }

  const tour = await Tour.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).populate("createdBy", "name email");

  if (!tour) {
    return next(new AppError("Tour not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Tour updated successfully",
    data: tour,
  });
});


// Delete tour (admin)
const deleteTour = asyncHandler(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError("Tour not found", 404));
  }

  if (tour.images?.length > 0) {
    await Promise.all(tour.images.map((img) => deleteImage(img.public_id)));
  }

  await tour.deleteOne();

  res.status(200).json({
    success: true,
    message: "Tour deleted successfully",
  });
});

module.exports = {
  createTour,
  getTours,
  getTour,
  getPopularTours,
  togglePopular,
  updateTour,
  deleteTour,
};
