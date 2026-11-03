require("dotenv").config();
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Destination = require("./models/Destination");
const authRoutes = require("./routes/authRoutes");
const tripRoutes = require("./routes/tripRoutes");
const hotelRoutes = require("./routes/hotelRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const itineraryRoutes = require("./routes/itineraryRoutes");
const foodRoutes = require("./routes/foodRoutes");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/itinerary", itineraryRoutes);
app.use("/api/food", foodRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected!"))
  .catch((error) =>
    console.log("MongoDB connection failed:", error)
  );

app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user
  });
});

app.get("/api/destinations", async (req, res) => {
  try {
    const destinations = await Destination.find();
    res.json(destinations);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch destinations"
    });
  }
});

app.get("/api/destinations/:id", async (req, res) => {
  try {
    const destination = await Destination.findById(
      req.params.id
    );

    if (!destination) {
      return res.status(404).json({
        message: "Destination not found"
      });
    }

    res.json(destination);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch destination"
    });
  }
});

app.post("/api/destinations", async (req, res) => {
  try {
    const destination = await Destination.create(req.body);
    res.status(201).json(destination);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create destination"
    });
  }
});

app.put("/api/destinations/:id", async (req, res) => {
  try {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!destination) {
      return res.status(404).json({
        message: "Destination not found"
      });
    }

    res.json(destination);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update destination"
    });
  }
});

app.delete("/api/destinations/:id", async (req, res) => {
  try {
    const destination = await Destination.findByIdAndDelete(
      req.params.id
    );

    if (!destination) {
      return res.status(404).json({
        message: "Destination not found"
      });
    }

    res.json({
      message: "Destination deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete destination"
    });
  }
});

app.get("/", (req, res) => {
  res.send("Travel Explorer API is running!");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});