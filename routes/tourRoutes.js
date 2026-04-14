const express = require("express");
const router = express.Router();
const upload = require("../utils/upload");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

const tourController = require("../controllers/tourController");

const {
  createTour,
  getTours,
  getTour,
  getPopularTours,
  togglePopular,
  updateTour,
  deleteTour,
} = tourController;

//   create tour
router.post("/", protect, admin, upload.array("images", 5), createTour);

// get popular tours
router.get("/popular", getPopularTours);

// get all tours
router.get("/", getTours);

// get single tour
router.get("/:id", getTour);

// toggle popularity
router.put("/toggle-popular/:id", protect, admin, togglePopular);

// update tour
router.put("/:id", protect, admin, upload.array("images", 5), updateTour);
// delete tour
router.delete("/:id", protect, admin, deleteTour);

module.exports = router;
