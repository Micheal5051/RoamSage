const express = require("express");
const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const authMiddleware = require("../middleware/authMiddleware");
const { getIndianDestination } = require("../utils/indiaOnly");

const router = express.Router();

function getUserId(req) {
  return req.user?.userId || req.user?.id || req.user?._id;
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function findUserTrip(tripId, userId) {
  if (!isValidObjectId(tripId)) {
    return null;
  }

  const trip = await Trip.findOne({
    _id: tripId,
    userId
  });

  return trip && getIndianDestination(trip.destination) ? trip : null;
}

// Create a regular trip.
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      title,
      destination,
      startDate,
      endDate,
      notes
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Unable to identify the logged-in user."
      });
    }

    if (!title || !destination || !startDate || !endDate) {
      return res.status(400).json({
        message: "Title, destination, start date, and end date are required."
      });
    }

    const canonicalDestination = getIndianDestination(destination);
    if (!canonicalDestination) {
      return res.status(400).json({
        message: "Trips are currently supported only for destinations in India."
      });
    }

    const trip = await Trip.create({
      userId,
      title,
      destination: canonicalDestination.name,
      startDate,
      endDate,
      notes: notes || ""
    });

    return res.status(201).json({
      message: "Trip created successfully.",
      trip
    });
  } catch (error) {
    console.error("Create trip error:", error);

    return res.status(500).json({
      message: "Failed to create trip."
    });
  }
});

// Save a generated itinerary. If tripId is supplied, update that user's
// existing trip instead of creating a duplicate.
// Other trip fields and manually added itinerary/place entries are preserved.
// Keep this fixed route before router.get("/:id").
router.post("/save-generated", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      tripId,
      destination,
      startDate,
      endDate,
      generatedItinerary,
      journeyPlan
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Unable to identify the logged-in user."
      });
    }

    if (
      typeof destination !== "string" ||
      !destination.trim() ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        message: "Destination, start date, and end date are required."
      });
    }

    const canonicalDestination = getIndianDestination(destination);
    if (!canonicalDestination) {
      return res.status(400).json({
        message: "Generated trips are currently supported only for destinations in India."
      });
    }

    if (
      !generatedItinerary ||
      typeof generatedItinerary !== "object" ||
      !Array.isArray(generatedItinerary.days)
    ) {
      return res.status(400).json({
        message: "A valid generated itinerary with a days array is required."
      });
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (
      Number.isNaN(parsedStartDate.getTime()) ||
      Number.isNaN(parsedEndDate.getTime()) ||
      parsedEndDate < parsedStartDate
    ) {
      return res.status(400).json({
        message: "Please provide valid travel dates."
      });
    }

    let trip;
    let created = false;

    if (tripId) {
      if (!isValidObjectId(tripId)) {
        return res.status(400).json({
          message: "Invalid trip ID."
        });
      }

      trip = await findUserTrip(tripId, userId);

      if (!trip) {
        return res.status(404).json({
          message:
            "Trip not found or you do not have permission to update it."
        });
      }

      // Only replace generated content. Preserve title, notes, manual
      // itinerary entries, saved places, and the original trip dates.
      trip.generatedItinerary = generatedItinerary;

      if (journeyPlan && typeof journeyPlan === "object") {
        trip.journeyPlan = journeyPlan;
      }

      await trip.save();
    } else {
      trip = await Trip.create({
        userId,
        title: `${canonicalDestination.name} Travel Plan`,
        destination: canonicalDestination.name,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        notes: "Automatically generated travel itinerary",
        generatedItinerary,
        ...(journeyPlan && typeof journeyPlan === "object"
          ? { journeyPlan }
          : {})
      });

      created = true;
    }

    return res.status(created ? 201 : 200).json({
      message: created
        ? "Generated itinerary saved successfully."
        : "Generated itinerary updated successfully.",
      created,
      trip
    });
  } catch (error) {
    console.error("Save generated itinerary error:", error);

    return res.status(500).json({
      message: "Failed to save generated itinerary.",
      error: error.message
    });
  }
});

// Get all trips belonging to the logged-in user.
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Unable to identify the logged-in user."
      });
    }

    const trips = await Trip.find({ userId }).sort({
      createdAt: -1
    });
    const indiaTrips = trips.filter((trip) =>
      getIndianDestination(trip.destination)
    );

    return res.json(indiaTrips);
  } catch (error) {
    console.error("Get trips error:", error);

    return res.status(500).json({
      message: "Failed to fetch trips."
    });
  }
});

// Add an itinerary item to a trip.
router.post("/:id/itinerary", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);
    const trip = await findUserTrip(req.params.id, userId);

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found."
      });
    }

    const { day, title, time, notes } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Itinerary item title is required."
      });
    }

    trip.itinerary.push({
      day: day || 1,
      title,
      time: time || "",
      notes: notes || ""
    });

    await trip.save();

    return res.status(201).json({
      message: "Itinerary item added successfully.",
      trip
    });
  } catch (error) {
    console.error("Add itinerary item error:", error);

    return res.status(500).json({
      message: "Failed to add itinerary item."
    });
  }
});

// Delete an itinerary item from a trip.
router.delete(
  "/:id/itinerary/:itemId",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = getUserId(req);
      const trip = await findUserTrip(req.params.id, userId);

      if (!trip) {
        return res.status(404).json({
          message: "Trip not found."
        });
      }

      const item = trip.itinerary.id(req.params.itemId);

      if (!item) {
        return res.status(404).json({
          message: "Itinerary item not found."
        });
      }

      item.deleteOne();
      await trip.save();

      return res.json({
        message: "Itinerary item deleted successfully.",
        trip
      });
    } catch (error) {
      console.error("Delete itinerary item error:", error);

      return res.status(500).json({
        message: "Failed to delete itinerary item."
      });
    }
  }
);

// Add a place to a trip.
router.post("/:id/places", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);
    const trip = await findUserTrip(req.params.id, userId);

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found."
      });
    }

    const { name, address, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Place name is required."
      });
    }

    trip.places.push({
      name: name.trim(),
      address: address || "",
      notes: notes || "",
      visited: false
    });

    await trip.save();

    return res.status(201).json({
      message: "Place added successfully.",
      trip
    });
  } catch (error) {
    console.error("Add place error:", error);

    return res.status(500).json({
      message: "Failed to add place."
    });
  }
});

// Delete a place from a trip.
router.delete(
  "/:id/places/:placeId",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = getUserId(req);
      const trip = await findUserTrip(req.params.id, userId);

      if (!trip) {
        return res.status(404).json({
          message: "Trip not found."
        });
      }

      const place = trip.places.id(req.params.placeId);

      if (!place) {
        return res.status(404).json({
          message: "Place not found."
        });
      }

      place.deleteOne();
      await trip.save();

      return res.json({
        message: "Place deleted successfully.",
        trip
      });
    } catch (error) {
      console.error("Delete place error:", error);

      return res.status(500).json({
        message: "Failed to delete place."
      });
    }
  }
);

// Toggle a place's visited status.
router.patch(
  "/:id/places/:placeId/visited",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = getUserId(req);
      const trip = await findUserTrip(req.params.id, userId);

      if (!trip) {
        return res.status(404).json({
          message: "Trip not found."
        });
      }

      const place = trip.places.id(req.params.placeId);

      if (!place) {
        return res.status(404).json({
          message: "Place not found."
        });
      }

      place.visited =
        typeof req.body.visited === "boolean"
          ? req.body.visited
          : !place.visited;

      await trip.save();

      return res.json({
        message: "Place status updated successfully.",
        trip
      });
    } catch (error) {
      console.error("Update place status error:", error);

      return res.status(500).json({
        message: "Failed to update place status."
      });
    }
  }
);

// Get one trip. Keep this after the fixed routes above.
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);
    const trip = await findUserTrip(req.params.id, userId);

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found."
      });
    }

    return res.json(trip);
  } catch (error) {
    console.error("Get trip error:", error);

    return res.status(500).json({
      message: "Failed to fetch trip."
    });
  }
});

// Update a trip.
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);

    const allowedFields = [
      "title",
      "destination",
      "startDate",
      "endDate",
      "notes"
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.destination !== undefined) {
      const canonicalDestination = getIndianDestination(updates.destination);
      if (!canonicalDestination) {
        return res.status(400).json({
          message: "Trips are currently supported only for destinations in India."
        });
      }
      updates.destination = canonicalDestination.name;
    }

    const existingTrip = await findUserTrip(req.params.id, userId);
    if (!existingTrip) {
      return res.status(404).json({
        message: "Trip not found."
      });
    }

    const trip = await Trip.findOneAndUpdate(
      {
        _id: req.params.id,
        userId
      },
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found."
      });
    }

    return res.json({
      message: "Trip updated successfully.",
      trip
    });
  } catch (error) {
    console.error("Update trip error:", error);

    return res.status(500).json({
      message: "Failed to update trip."
    });
  }
});

// Delete a trip.
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);

    const existingTrip = await findUserTrip(req.params.id, userId);

    if (!existingTrip) {
      return res.status(404).json({
        message: "Trip not found."
      });
    }

    await Trip.findByIdAndDelete(req.params.id);

    return res.json({
      message: "Trip deleted successfully."
    });
  } catch (error) {
    console.error("Delete trip error:", error);

    return res.status(500).json({
      message: "Failed to delete trip."
    });
  }
});

module.exports = router;