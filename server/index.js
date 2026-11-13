
require("dotenv").config();

const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Destination = require("./models/Destination");
const {
  getIndianDestination,
  isIndianDestinationRecord
} = require("./utils/indiaOnly");

const authRoutes = require("./routes/authRoutes");
const tripRoutes = require("./routes/tripRoutes");
const hotelRoutes = require("./routes/hotelRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const itineraryRoutes = require("./routes/itineraryRoutes");
const foodRoutes = require("./routes/foodRoutes");
const aiRoutes = require("./routes/aiRoutes");
const searchRoutes = require("./routes/searchRoutes");
const activityRoutes = require("./routes/activityRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const recommendationRoutes = require("./routes/recommendationRoutes");

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// API ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/itinerary", itineraryRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/recommendations", recommendationRoutes);

// MONGODB CONNECTION
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected!"))
  .catch((error) =>
    console.log("MongoDB connection failed:", error)
  );

// AUTHENTICATION CHECK
app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user
  });
});

// GET ALL DESTINATIONS
app.get("/api/destinations", async (req, res) => {
  try {
    const destinations = await Destination.find();
    const approved = destinations.filter(isIndianDestinationRecord);
    const unique = new Map();

    approved.forEach((destination) => {
      const key = String(destination.name || "").trim().toLowerCase();
      if (key && !unique.has(key)) unique.set(key, destination);
    });

    res.json([...unique.values()]);
  } catch (error) {
    console.error("Fetch destinations error:", error);

    res.status(500).json({
      message: "Failed to fetch destinations"
    });
  }
});

// GET ONE DESTINATION
app.get("/api/destinations/:id", async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination || !isIndianDestinationRecord(destination)) {
      return res.status(404).json({
        message: "Destination not found in the supported India-only catalogue."
      });
    }

    res.json(destination);
  } catch (error) {
    console.error("Fetch destination error:", error);

    res.status(500).json({
      message: "Failed to fetch destination"
    });
  }
});

// CREATE DESTINATION
app.post("/api/destinations", async (req, res) => {
  try {
    const canonical = getIndianDestination(req.body?.name);

    if (!canonical) {
      return res.status(400).json({
        message: "Only destinations in the supported Indian destination catalogue can be added."
      });
    }

    const existing = await Destination.findOne({
      name: {
        $regex: `^${canonical.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i"
      }
    });

    if (existing) {
      const destination = await Destination.findByIdAndUpdate(
        existing._id,
        {
          $set: {
            name: canonical.name,
            country: canonical.country,
            latitude: canonical.latitude,
            longitude: canonical.longitude
          }
        },
        { new: true, runValidators: true }
      );

      return res.json(destination);
    }

    const destination = await Destination.create({
      ...req.body,
      name: canonical.name,
      country: canonical.country,
      latitude: canonical.latitude,
      longitude: canonical.longitude
    });

    return res.status(201).json(destination);
  } catch (error) {
    console.error("Create destination error:", error);

    res.status(500).json({
      message: "Failed to create destination",
      error: error.message
    });
  }
});

// UPDATE DESTINATION
app.put("/api/destinations/:id", async (req, res) => {
  try {
    const existing = await Destination.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        message: "Destination not found"
      });
    }

    const candidate = {
      ...existing.toObject(),
      ...req.body
    };

    if (!isIndianDestinationRecord(candidate)) {
      return res.status(400).json({
        message: "Destination identity, region and coordinates must match a supported Indian destination."
      });
    }

    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      {
        new: true,
        runValidators: true,
        strict: true
      }
    );

    return res.json(destination);
  } catch (error) {
    console.error("Update destination error:", error);

    return res.status(500).json({
      message: "Failed to update destination",
      error: error.message
    });
  }
});

// DELETE DESTINATION
app.delete("/api/destinations/:id", async (req, res) => {
  try {
    const existing = await Destination.findById(req.params.id);

    if (!existing || !isIndianDestinationRecord(existing)) {
      return res.status(404).json({
        message: "Destination not found"
      });
    }

    await Destination.findByIdAndDelete(req.params.id);

    res.json({
      message: "Destination deleted successfully"
    });
  } catch (error) {
    console.error("Delete destination error:", error);

    res.status(500).json({
      message: "Failed to delete destination"
    });
  }
});

// HOME ROUTE
app.get("/", (req, res) => {
  res.send("Travel Explorer API is running!");
});

// START SERVER
const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Travel Explorer API running on port ${PORT}`);
});
