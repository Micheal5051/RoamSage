const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const {
  generateItinerary
} = require("../utils/itineraryGenerator");

const router = express.Router();

router.post("/generate", authMiddleware, (req, res) => {
  try {
    const {
      destination,
      startDate,
      endDate,
      interests = [],
      journeyPlan = null
    } = req.body;

    if (
      typeof destination !== "string" ||
      destination.trim().length === 0
    ) {
      return res.status(400).json({
        message: "Please provide a destination."
      });
    }

    if (
      typeof startDate !== "string" ||
      typeof endDate !== "string"
    ) {
      return res.status(400).json({
        message: "Please provide a start date and end date."
      });
    }

    if (!Array.isArray(interests)) {
      return res.status(400).json({
        message: "Interests must be an array."
      });
    }

    if (
      !interests.every(
        (interest) => typeof interest === "string"
      )
    ) {
      return res.status(400).json({
        message: "Every interest must be a string."
      });
    }

    if (
      journeyPlan !== null &&
      (typeof journeyPlan !== "object" || Array.isArray(journeyPlan))
    ) {
      return res.status(400).json({
        message: "Journey plan must be an object."
      });
    }

    const result = generateItinerary({
      destination: destination.trim(),
      startDate,
      endDate,
      interests,
      journeyPlan
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 400).json({
      message: error.message || "Failed to generate itinerary."
    });
  }
});

module.exports = router;