require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const helmet = require('helmet')
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const tourRoutes = require("./routes/tourRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();
app.use(
  cors({
    // origin: process.env.CLIENT_URL,
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(helmet())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tour", tourRoutes);
app.use("/api/booking", bookingRoutes);
app.use(errorMiddleware)

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT} 👌`);
    });
  } catch (error) {
    console.error(`Failed to connect`);
    console.error(error.message);
  }
};
startServer();
