const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");

const profileRoutes = require("./routes/profileRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const dailyTrackingRoutes = require("./routes/dailyTrackingRoutes");
const workoutPlanRoutes = require("./routes/workoutPlanRoutes");
const workoutLogRoutes = require("./routes/workoutLogRoutes");
const measurementRoutes = require("./routes/measurementRoutes");
const photoRoutes = require("./routes/photoRoutes");
const performanceRoutes = require("./routes/performanceRoutes");
const authRoutes = require("./routes/authRoutes");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("GymTrack Backend çalışıyor.");
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "API çalışıyor.",
  });
});

app.use("/api/profile", profileRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/daily-tracking", dailyTrackingRoutes);
app.use("/api/workout-plans", workoutPlanRoutes);
app.use("/api/workout-logs", workoutLogRoutes);
app.use("/api/measurements", measurementRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor.`);
});