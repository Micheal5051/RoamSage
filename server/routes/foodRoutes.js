const express = require("express");
const calculateDistance = require("../utils/distance");
const {
  isWithinIndiaBounds,
  isGeoapifyIndiaFeature,
  isGeoapifyFoodFeature
} = require("../utils/indiaOnly");

const router = express.Router();

async function confirmIndianCoordinates(latitude, longitude, apiKey) {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    format: "json",
    apiKey
  });

  const response = await fetch(
    `https://api.geoapify.com/v1/geocode/reverse?${params}`
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error("Could not verify the lunch location's country.");
  }

  const location = data.results?.[0];

  if (!location || !isGeoapifyIndiaFeature(location)) {
    return false;
  }

  return true;
}

router.get("/nearby", async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    const apiKey = process.env.GEOAPIFY_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: "Geoapify API key is missing from the server .env file."
      });
    }

    if (
      req.query.lat === undefined ||
      req.query.lon === undefined ||
      !isWithinIndiaBounds(lat, lon)
    ) {
      return res.status(400).json({
        message: "A valid location within India is required for nearby food search."
      });
    }

    const isIndianLocation = await confirmIndianCoordinates(lat, lon, apiKey);

    if (!isIndianLocation) {
      return res.status(400).json({
        message: "Nearby food search is available only for locations in India."
      });
    }

    const params = new URLSearchParams({
      categories: "catering.restaurant,catering.cafe,catering.fast_food",
      filter: `circle:${lon},${lat},3000`,
      bias: `proximity:${lon},${lat}`,
      limit: "50",
      lang: "en",
      apiKey
    });

    const response = await fetch(
      `https://api.geoapify.com/v2/places?${params}`
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Geoapify error:", response.status, data);

      return res.status(response.status === 429 ? 429 : 502).json({
        message: "The nearby places service could not complete the search."
      });
    }

    const places = (data.features || [])
      .map((feature) => {
        const properties = feature.properties || {};
        const coordinates = feature.geometry?.coordinates;

        if (
          !isGeoapifyIndiaFeature(properties) ||
          !isGeoapifyFoodFeature(properties) ||
          !Array.isArray(coordinates) ||
          coordinates.length < 2
        ) {
          return null;
        }

        const [placeLon, placeLat] = coordinates;

        if (!isWithinIndiaBounds(placeLat, placeLon)) {
          return null;
        }

        const distance = calculateDistance(lat, lon, placeLat, placeLon);
        if (distance > 3) return null;

        return {
          id: properties.place_id,
          name: properties.name || "Unnamed place",
          country: "India",
          lat: placeLat,
          lon: placeLon,
          address: properties.formatted || "",
          category: properties.categories?.[0] || "Restaurant",
          distance: Number(distance.toFixed(3)),
          mapsUrl: `https://www.google.com/maps/dir/?api=1&origin=${lat},${lon}&destination=${placeLat},${placeLon}&travelmode=driving`
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20);

    return res.json({ places });
  } catch (error) {
    console.error("Nearby places error:", error.message);

    return res.status(502).json({
      message: "Unable to verify or search nearby Indian food places right now."
    });
  }
});

module.exports = router;
