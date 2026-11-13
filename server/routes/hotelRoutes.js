const express = require("express");
const hotels = require("../data/hotels");
const calculateDistance = require("../utils/distance");
const { isIndianHotel, isWithinIndiaBounds } = require("../utils/indiaOnly");

const router = express.Router();
const indianHotels = hotels.filter(isIndianHotel);
const MAX_SEARCH_RADIUS_KM = 20;

// GET HOTELS NEAR AN ATTRACTION. Only curated Indian hotel records are eligible.
router.get("/", (req, res) => {
  const latitude = Number(req.query.latitude);
  const longitude = Number(req.query.longitude);
  const requestedRadius = req.query.radius === undefined
    ? 5
    : Number(req.query.radius);

  if (
    req.query.latitude === undefined ||
    req.query.longitude === undefined ||
    !isWithinIndiaBounds(latitude, longitude)
  ) {
    return res.status(400).json({
      message: "Valid Indian destination coordinates are required."
    });
  }

  if (
    !Number.isFinite(requestedRadius) ||
    requestedRadius <= 0 ||
    requestedRadius > MAX_SEARCH_RADIUS_KM
  ) {
    return res.status(400).json({
      message: `Search radius must be greater than 0 and no more than ${MAX_SEARCH_RADIUS_KM} km.`
    });
  }

  const hotelsWithDistances = indianHotels.map((hotel) => {
    const distance = calculateDistance(
      latitude,
      longitude,
      hotel.location.latitude,
      hotel.location.longitude
    );

    return {
      ...hotel,
      distance: Number(distance.toFixed(2))
    };
  });

  const nearbyHotels = hotelsWithDistances
    .filter((hotel) => hotel.distance <= requestedRadius)
    .sort((a, b) => a.distance - b.distance);

  return res.json(nearbyHotels);
});

// GET ONE HOTEL. The same India-only check also protects direct detail lookup.
router.get("/:id", (req, res) => {
  const hotel = indianHotels.find(
    (item) => String(item.id) === String(req.params.id)
  );

  if (!hotel) {
    return res.status(404).json({
      message: "Hotel not found in the supported India-only catalogue."
    });
  }

  return res.json(hotel);
});

module.exports = router;
