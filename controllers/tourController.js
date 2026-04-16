const Tour = require("../models/Tour");
const cloudinary = require("../utils/cloudinary");

const { streamUpload, deleteImage } = cloudinary;

// create Tour (admin)
const createTour = async (req, res) => {
  try {
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
        req.files.map((file) => streamUpload(file.buffer, "tours")),
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
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all Tours
const getTours = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    // search by title (case-insensitive)
    if (search) {
      query.title = { $regex: search, $option: "i" };
    }
    const tours = await Tour.find().populate("createdBy", "name email");
    res.status(200).json({
      success: true,
      count: tours.length,
      data: tours,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single tour
const getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id).populate(
      "createdBy",
      "name email",
    );
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }
    res.status(200).json({
      success: true,
      data: tour,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get Popular tour
const getPopularTours = async (req, res) => {
  try {
    const tours = await Tour.find({ isPopular: true }).limit(6);
    res.status(200).json({
      success: true,
      count: tours.length,
      data: tours,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// toggle popularity
const togglePopular = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    tour.isPopular = !tour.isPopular;
    await tour.save();
    res.status(200).json({
      success: true,
      message: "Popularity updated",
      data: tour,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update tour (admin)
const updateTour = async (req, res) => {
  try {
    let updateData = { ...req.body };
    if (req.body.isPopular !== undefined) {
      updateData.isPopular = req.body.isPopular === "true";
    }

    if (req.files && req.files.length > 0) {
      const existingTour = await Tour.findById(req.params.id);

      if (!existingTour) {
        return res.status(404).json({
          success: false,
          message: "Tour not found",
        });
      }

      if (existingTour.images.length > 0) {
        await Promise.all(
          existingTour.images.map((img) => deleteImage(img.public_id)),
        );
      }

      const results = await Promise.all(
        req.files.map((file) => streamUpload(file.buffer, "tours")),
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
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tour updated successfully",
      data: tour,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete tour (admin)
const deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    if (tour.images && tour.images.length > 0) {
      await Promise.all(tour.images.map((img) => deleteImage(img.public_id)));
    }

    await tour.deleteOne();

    res.status(200).json({
      success: true,
      message: "Tour deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createTour,
  getTours,
  getTour,
  getPopularTours,
  togglePopular,
  updateTour,
  deleteTour,
};
