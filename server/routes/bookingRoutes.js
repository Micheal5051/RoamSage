
const express = require("express");
const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const Trip = require("../models/Trip");
const hotels = require("../data/hotels");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get the logged-in user's ID.
function getUserId(req) {
  return req.user?.userId || req.user?.id || req.user?._id;
}

// Find a hotel using trusted server-side data.
function findHotel(hotelId) {
  return hotels.find(
    (hotel) => String(hotel.id) === String(hotelId)
  );
}

// Validate dates and calculate the number of nights.
function getBookingNights(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDay = new Date(start);
  startDay.setHours(0, 0, 0, 0);

  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);

  if (startDay < today || endDay <= startDay) {
    return null;
  }

  return Math.round(
    (endDay.getTime() - startDay.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

/*
CREATE BOOKING
POST /api/bookings
*/
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Unable to identify the logged-in user."
      });
    }

    const {
      hotelId,
      tripId,
      checkIn,
      checkOut,
      guests,
      guestName,
      guestEmail
    } = req.body;

    if (
      !hotelId ||
      !checkIn ||
      !checkOut ||
      guests == null ||
      !guestName?.trim() ||
      !guestEmail?.trim()
    ) {
      return res.status(400).json({
        message: "All booking details are required."
      });
    }

    const guestCount = Number(guests);

    if (
      !Number.isInteger(guestCount) ||
      guestCount < 1
    ) {
      return res.status(400).json({
        message: "Guests must be a positive whole number."
      });
    }

    const nights = getBookingNights(checkIn, checkOut);

    if (nights === null) {
      return res.status(400).json({
        message:
          "Check-in must be today or later, and check-out must be after check-in."
      });
    }

    const hotel = findHotel(hotelId);

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found."
      });
    }

    // Verify the selected trip if tripId was provided.
    let selectedTripId = null;

    if (
      tripId !== undefined &&
      tripId !== null &&
      tripId !== ""
    ) {
      if (!mongoose.Types.ObjectId.isValid(tripId)) {
        return res.status(400).json({
          message: "Invalid trip ID."
        });
      }

      const trip = await Trip.findOne({
        _id: tripId,
        userId
      });

      if (!trip) {
        return res.status(404).json({
          message:
            "Trip not found or you do not have permission to use this trip."
        });
      }

      selectedTripId = trip._id;
    }

    const pricePerNight = Number(hotel.price.amount);

    if (
      !Number.isFinite(pricePerNight) ||
      pricePerNight <= 0
    ) {
      return res.status(500).json({
        message: "Hotel price is currently unavailable."
      });
    }

    // Calculate the total on the server.
    // Never trust a total submitted by the browser.
    const totalPrice = nights * pricePerNight;

    const booking = await Booking.create({
      userId,
      hotelId: String(hotel.id),
      hotelName: hotel.name,
      tripId: selectedTripId,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guests: guestCount,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
      pricePerNight,
      totalPrice
    });

    return res.status(201).json(booking);
  } catch (error) {
    console.error("Create booking error:", error);

    return res.status(500).json({
      message: "Failed to create booking."
    });
  }
});

/*
GET MY BOOKINGS
GET /api/bookings
*/
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);

    const bookings = await Booking.find({
      userId
    }).sort({ createdAt: -1 });

    return res.json(bookings);
  } catch (error) {
    console.error("Fetch bookings error:", error);

    return res.status(500).json({
      message: "Failed to fetch bookings."
    });
  }
});

/*
GET ONE BOOKING
GET /api/bookings/:id
*/
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid booking ID."
      });
    }

    const booking = await Booking.findOne({
      _id: id,
      userId
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found."
      });
    }

    return res.json(booking);
  } catch (error) {
    console.error("Fetch booking error:", error);

    return res.status(500).json({
      message: "Failed to fetch booking."
    });
  }
});

/*
CANCEL BOOKING
PATCH /api/bookings/:id/cancel
*/
router.patch(
  "/:id/cancel",
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid booking ID."
        });
      }

      const booking = await Booking.findOne({
        _id: id,
        userId
      });

      if (!booking) {
        return res.status(404).json({
          message: "Booking not found."
        });
      }

      if (booking.status === "cancelled") {
        return res.status(400).json({
          message: "This booking has already been cancelled."
        });
      }

      booking.status = "cancelled";
      await booking.save();

      return res.json({
        message: "Booking cancelled successfully.",
        booking
      });
    } catch (error) {
      console.error("Cancel booking error:", error);

      return res.status(500).json({
        message: "Failed to cancel booking."
      });
    }
  }
);

module.exports = router;
