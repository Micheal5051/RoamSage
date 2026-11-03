
const express = require("express");

const router = express.Router();

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
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return res.status(400).json({
        message: "Valid latitude and longitude are required."
      });
    }

    const params = new URLSearchParams({
      categories: "catering.restaurant,catering.cafe,accommodation",
      filter: `circle:${lon},${lat},3000`,
      bias: `proximity:${lon},${lat}`,
      limit: "20",
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
          !Array.isArray(coordinates) ||
          coordinates.length < 2
        ) {
          return null;
        }

        const [placeLon, placeLat] = coordinates;

        return {
          id: properties.place_id,
          name: properties.name || "Unnamed place",
          lat: placeLat,
          lon: placeLon,
          address: properties.formatted || "",
          category: properties.categories?.[0] || "Place",
          distance: Math.round(
            Math.hypot(
              (placeLat - lat) * 111,
              (placeLon - lon) * 111 *
                Math.cos((lat * Math.PI) / 180)
            ) * 1000
          ) / 1000,
          mapsUrl: `https://www.google.com/maps/dir/?api=1&origin=${lat},${lon}&destination=${placeLat},${placeLon}&travelmode=driving`
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance);

    return res.json({ places });
  } catch (error) {
    console.error("Nearby places error:", error.message);

    return res.status(500).json({
      message: "Unable to search nearby places right now."
    });
  }
});

module.exports = router;
