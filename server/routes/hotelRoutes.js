const express = require("express");

const hotels = require("../data/hotels");

const calculateDistance = require(
  "../utils/distance"
);

const router = express.Router();

// GET HOTELS
router.get("/", (req, res) => {
  const latitude = Number(
    req.query.latitude
  );

  const longitude = Number(
    req.query.longitude
  );

  const radius =
    Number(req.query.radius) || 5;

  if (
    Number.isNaN(latitude) ||
    Number.isNaN(longitude)
  ) {
    return res.status(400).json({
      message:
        "Latitude and longitude are required"
    });
  }

  const nearbyHotels = hotels
    .map((hotel) => {
      const distance =
        calculateDistance(
          latitude,
          longitude,
          hotel.location.latitude,
          hotel.location.longitude
        );

      return {
        ...hotel,
        distance: Number(
          distance.toFixed(2)
        )
      };
    })
    .filter(
      (hotel) =>
        hotel.distance <= radius
    )
    .sort(
      (a, b) =>
        a.distance - b.distance
    );

  res.json(nearbyHotels);
});

// GET ONE HOTEL
router.get("/:id", (req, res) => {
  const hotel = hotels.find(
    (hotel) =>
      hotel.id === req.params.id
  );

  if (!hotel) {
    return res.status(404).json({
      message: "Hotel not found"
    });
  }

  res.json(hotel);
});

module.exports = router;