const express = require("express");
const Destination = require("../models/Destination");
const hotels = require("../data/hotels");
const attractions = require("../data/attractions");
const calculateDistance = require("../utils/distance");
const {
  normalizeName,
  getIndianDestination,
  isIndianDestinationRecord,
  isIndianAttraction,
  isIndianHotel,
  isWithinIndiaBounds,
  isGeoapifyIndiaFeature,
  isGeoapifyFoodFeature
} = require("../utils/indiaOnly");

const router = express.Router();

const normalize = (value) => normalizeName(value);

const removeCommonWords = (query) =>
  normalize(query)
    .split(/\s+/)
    .filter(
      (word) =>
        ![
          "in", "at", "near", "the", "best", "show", "me", "find",
          "search", "for", "to", "visit", "places", "place", "hotels",
          "hotel", "food", "restaurants", "restaurant", "cafes", "cafe",
          "eateries", "activities", "activity", "things", "do", "stay",
          "accommodation"
        ].includes(word)
    );

const matchesQuery = (item, fields, terms) => {
  if (terms.length === 0) return true;

  const searchableText = normalize(
    fields
      .map((field) => item[field])
      .filter(Boolean)
      .join(" ")
  );

  return terms.some((term) => searchableText.includes(term));
};

// Food search always starts from a curated Indian destination. The user's
// restaurant name is sent as a place-name filter; it is never geocoded.
const searchFood = async (destination, query, apiKey) => {
  if (!destination || !apiKey) return [];

  const latitude = Number(destination.latitude);
  const longitude = Number(destination.longitude);

  if (!isWithinIndiaBounds(latitude, longitude)) {
    throw new Error("The selected destination is not within India.");
  }

  const terms = removeCommonWords(query);
  const nameQuery = terms.join(" ").trim();

  const placesParams = new URLSearchParams({
    categories: "catering.restaurant,catering.cafe,catering.fast_food",
    filter: `circle:${longitude},${latitude},5000`,
    bias: `proximity:${longitude},${latitude}`,
    limit: "50",
    lang: "en",
    apiKey
  });

  if (nameQuery) {
    placesParams.set("name", nameQuery);
  }

  const placesResponse = await fetch(
    `https://api.geoapify.com/v2/places?${placesParams}`
  );

  const placesData = await placesResponse.json();

  if (!placesResponse.ok) {
    throw new Error("Geoapify food search failed.");
  }

  return (placesData.features || [])
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

      const [placeLongitude, placeLatitude] = coordinates;

      if (!isWithinIndiaBounds(placeLatitude, placeLongitude)) {
        return null;
      }

      const distance = calculateDistance(
        latitude,
        longitude,
        placeLatitude,
        placeLongitude
      );

      if (distance > 5) return null;

      const name = String(properties.name || "").trim();
      if (!name) return null;

      const searchableName = normalize(
        `${name} ${properties.address_line1 || ""}`
      );

      if (
        terms.length > 0 &&
        !terms.every((term) => searchableName.includes(term))
      ) {
        return null;
      }

      return {
        id: properties.place_id,
        name,
        destination: destination.name,
        country: "India",
        address: properties.formatted || "",
        category: properties.categories?.[0] || "Restaurant",
        latitude: placeLatitude,
        longitude: placeLongitude,
        distance: Number(distance.toFixed(2)),
        mapsUrl: `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${placeLatitude},${placeLongitude}&travelmode=driving`
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 20);
};

router.get("/", async (req, res) => {
  try {
    const query = normalize(req.query.q);
    const requestedType = normalize(req.query.type || "all");

    if (!query) {
      return res.status(400).json({
        message: "Please enter something to search."
      });
    }

    const validTypes = ["all", "places", "hotels", "food", "activities"];

    if (!validTypes.includes(requestedType)) {
      return res.status(400).json({
        message: "Invalid search category."
      });
    }

    const terms = removeCommonWords(query);
    let type = requestedType;

    if (type === "all") {
      if (/\b(hotels?|accommodation|stay)\b/i.test(query)) {
        type = "hotels";
      } else if (/\b(restaurants?|food|cafes?|eateries)\b/i.test(query)) {
        type = "food";
      } else if (/\b(activities|activity|things to do|adventures?)\b/i.test(query)) {
        type = "activities";
      } else {
        type = "places";
      }
    }

    const results = {
      places: [],
      hotels: [],
      food: [],
      activities: []
    };

    if (type === "places") {
      const destinations = await Destination.find();
      const approvedDestinations = destinations.filter(isIndianDestinationRecord);
      const uniqueDestinations = new Map();

      approvedDestinations.forEach((destination) => {
        const key = normalize(destination.name);
        if (!uniqueDestinations.has(key)) {
          uniqueDestinations.set(key, destination);
        }
      });

      results.places = [...uniqueDestinations.values()].filter(
        (destination) =>
          matchesQuery(
            destination,
            ["name", "country", "description", "tags"],
            terms
          )
      );
    }

    if (type === "hotels") {
      results.hotels = hotels.filter(isIndianHotel).filter((hotel) =>
        matchesQuery(
          hotel,
          ["name", "destination", "address", "description", "amenities"],
          terms
        )
      );
    }

    if (type === "activities") {
      results.activities = attractions.filter(isIndianAttraction).filter((attraction) =>
        matchesQuery(
          attraction,
          ["name", "destination", "category", "tags"],
          terms
        )
      );
    }

    if (type === "food") {
      const destinationName = String(req.query.destination || "").trim();
      const destination = getIndianDestination(destinationName);

      if (!destination) {
        return res.status(400).json({
          message:
            "Choose a supported Indian destination before searching for restaurants."
        });
      }

      const apiKey = process.env.GEOAPIFY_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          message: "Geoapify API key is missing from the server .env file."
        });
      }

      results.food = await searchFood(destination, query, apiKey);
    }

    const total =
      results.places.length +
      results.hotels.length +
      results.food.length +
      results.activities.length;

    return res.json({
      query,
      type,
      destination: type === "food" ? String(req.query.destination).trim() : null,
      total,
      results,
      message:
        total > 0
          ? "Search completed successfully."
          : "No matching results found."
    });
  } catch (error) {
    console.error("Universal search error:", error.message);

    return res.status(502).json({
      message:
        "The search service could not complete your request. Please try again."
    });
  }
});

module.exports = router;
