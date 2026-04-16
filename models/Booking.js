const mongoose = require("mongoose");
const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: [true, "Tour is required"],
    },
    guests: {
      type: Number,
      required: [true, "Number of guests are required"],
      min: 1,
      default: 1,
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: 0,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    tourPrice: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
