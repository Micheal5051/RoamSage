const destinationCatalog = require("../data/destinations");
const calculateDistance = require("./distance");

const normalizeName = (value = "") =>
  String(value).trim().toLowerCase().replace(/\s+/g, " ");

// Broad coordinate bounds are a first-pass sanity check. They are not used
// alone as a country boundary; curated destination names and Indian region
// evidence are also required where records are stored locally.
const INDIA_BOUNDS = Object.freeze({
  minLatitude: 6,
  maxLatitude: 38.6,
  minLongitude: 68,
  maxLongitude: 98
});

const INDIAN_STATES_AND_UTS = Object.freeze([
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
]);

const destinationByName = new Map(
  destinationCatalog.map((destination) => [
    normalizeName(destination.name),
    destination
  ])
);

const INDIAN_HOTEL_DESTINATIONS = new Set([
  ...destinationByName.keys(),
  // Goa hotels and attractions already exist in the current data files.
  // Goa is also added to destinations.js in this fix so it can be selected.
  "goa"
]);

function isWithinIndiaBounds(latitude, longitude) {
  const lat = Number(latitude);
  const lon = Number(longitude);

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= INDIA_BOUNDS.minLatitude &&
    lat <= INDIA_BOUNDS.maxLatitude &&
    lon >= INDIA_BOUNDS.minLongitude &&
    lon <= INDIA_BOUNDS.maxLongitude
  );
}

function getIndianDestination(name) {
  if (!name) return null;
  return destinationByName.get(normalizeName(name)) || null;
}

function isIndianDestinationRecord(record) {
  if (!record || !record.name) return false;

  const canonical = getIndianDestination(record.name);
  if (!canonical) return false;

  // The existing field is named `country`, but many legacy entries store a
  // state/UT there. Compare with the curated record instead of assuming it
  // always contains the literal word "India".
  if (
    normalizeName(record.country) !==
    normalizeName(canonical.country)
  ) {
    return false;
  }

  if (!isWithinIndiaBounds(record.latitude, record.longitude)) {
    return false;
  }

  const distance = calculateDistance(
    Number(record.latitude),
    Number(record.longitude),
    Number(canonical.latitude),
    Number(canonical.longitude)
  );

  // Destinations are seeded from this catalogue. Reject records whose name
  // looks Indian but whose stored point was changed to a distant country.
  return distance <= 25;
}

function addressContainsIndianRegion(address = "") {
  const normalizedAddress = normalizeName(address);
  return INDIAN_STATES_AND_UTS.some((region) =>
    normalizedAddress.includes(normalizeName(region))
  );
}

function isIndianAttraction(attraction) {
  if (!attraction || !attraction.destination) return false;

  // Attractions are tied to a destination in the curated Indian catalogue.
  // A number of valid records do not yet have individual coordinates, so
  // destination membership is the required baseline check.
  if (!getIndianDestination(attraction.destination)) return false;

  const latitude = attraction.latitude ?? attraction.location?.latitude;
  const longitude = attraction.longitude ?? attraction.location?.longitude;

  // When coordinates are provided, they must also be geographically plausible.
  if (latitude === undefined && longitude === undefined) return true;
  if (latitude === undefined || longitude === undefined) return false;

  return isWithinIndiaBounds(latitude, longitude);
}

function isIndianHotel(hotel) {
  if (!hotel || !hotel.id || !hotel.name || !hotel.destination) {
    return false;
  }

  if (!INDIAN_HOTEL_DESTINATIONS.has(normalizeName(hotel.destination))) {
    return false;
  }

  // Country is explicit on all maintained hotel records. Do not infer the
  // country from a broad coordinate box or an ambiguous state name alone.
  if (normalizeName(hotel.countryCode) !== "in") {
    return false;
  }

  const latitude = Number(hotel.location?.latitude);
  const longitude = Number(hotel.location?.longitude);

  if (!isWithinIndiaBounds(latitude, longitude)) {
    return false;
  }

  if (normalizeName(hotel.price?.currency) !== "inr") {
    return false;
  }

  if (addressContainsIndianRegion(hotel.address)) {
    return true;
  }

  // Three older Hyderabad hotel records omit Telangana in their address.
  // Accept that legacy exception only when both the city and its coordinates
  // are consistent with Hyderabad.
  return (
    normalizeName(hotel.destination) === "hyderabad" &&
    normalizeName(hotel.address).includes("hyderabad") &&
    latitude >= 17.2 &&
    latitude <= 17.6 &&
    longitude >= 78.3 &&
    longitude <= 78.7
  );
}

function isGeoapifyIndiaFeature(properties = {}) {
  const countryCode = normalizeName(properties.country_code);
  const country = normalizeName(properties.country);
  return countryCode === "in" || country === "india";
}

function isGeoapifyFoodFeature(properties = {}) {
  const allowedPrefixes = [
    "catering.restaurant",
    "catering.cafe",
    "catering.fast_food"
  ];
  const categories = Array.isArray(properties.categories)
    ? properties.categories.map(normalizeName)
    : [];

  return categories.some((category) =>
    allowedPrefixes.some((prefix) =>
      category === prefix || category.startsWith(`${prefix}.`)
    )
  );
}

module.exports = {
  INDIA_BOUNDS,
  INDIAN_STATES_AND_UTS,
  normalizeName,
  isWithinIndiaBounds,
  getIndianDestination,
  isIndianDestinationRecord,
  isIndianAttraction,
  isIndianHotel,
  isGeoapifyIndiaFeature,
  isGeoapifyFoodFeature
};
