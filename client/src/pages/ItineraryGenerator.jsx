
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ItineraryGenerator.css";

const API_URL = "http://localhost:5000/api/itinerary/generate";
const SAVE_API_URL = "http://localhost:5000/api/trips/save-generated";
const FOOD_API_URL = "http://localhost:5000/api/food/nearby";
const MAX_FOOD_RESULTS = 15;
const HOTELS_API_URL = "http://localhost:5000/api/hotels";
const HOTEL_SEARCH_RADIUS_KM = 5;

// Coordinates match the attraction records in server/data/attractions.js.
const ATTRACTION_COORDINATES = {
  "charminar": { latitude: 17.3616, longitude: 78.4747 },
  "mecca masjid": { latitude: 17.3600, longitude: 78.4736 },
  "laad bazaar": { latitude: 17.3610, longitude: 78.4740 },
  "chowmahalla palace": { latitude: 17.3578, longitude: 78.4717 },
  "salar jung museum": { latitude: 17.3713, longitude: 78.4804 },
  "golconda fort": { latitude: 17.3833, longitude: 78.4011 },
  "qutb shahi tombs": { latitude: 17.3948, longitude: 78.3958 },
  "hussain sagar lake": { latitude: 17.4239, longitude: 78.4738 },
  "birla mandir": { latitude: 17.4062, longitude: 78.4691 },
  "nehru zoological park": { latitude: 17.3507, longitude: 78.4510 }
};

function getAttractionCoordinates(name) {
  const normalizedName = String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return ATTRACTION_COORDINATES[normalizedName] || null;
}

function getHotelPrice(hotel) {
  const amount = Number(hotel?.price?.amount ?? hotel?.pricePerNight);
  return Number.isFinite(amount) ? amount : null;
}

function formatHotelPrice(hotel) {
  const amount = getHotelPrice(hotel);
  if (amount === null) return "Price not provided";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: hotel?.price?.currency || "INR",
    maximumFractionDigits: 0
  }).format(amount) + " / night (estimate)";
}

const INTEREST_OPTIONS = [
  { label: "History", value: "history" },
  { label: "Architecture", value: "architecture" },
  { label: "Culture", value: "culture" },
  { label: "Nature", value: "nature" },
  { label: "Shopping", value: "shopping" },
  { label: "Food", value: "food" },
  { label: "Photography", value: "photography" },
  { label: "Wildlife", value: "wildlife" }
];

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTomorrowDateString() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getLocalDateString(tomorrow);
}

function formatDate(dateString) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  );
}

function formatDuration(minutes = 0) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${remainingMinutes} min`;
  if (remainingMinutes === 0) return `${hours} hr`;

  return `${hours} hr ${remainingMinutes} min`;
}

function formatTime(value) {
  if (!value) return "";
  if (/(AM|PM)$/i.test(value)) return value;

  const [hours, minutes] = value.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return value;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit"
  });
}

// ==========================================
// ROAD ROUTING
// ==========================================

const ROUTING_API_URL = "https://router.project-osrm.org/route/v1/driving";

function getCoordinates(place) {
  if (!place) return null;

  const rawLatitude =
    place.lat ??
    place.latitude ??
    place.location?.latitude;

  const rawLongitude =
    place.lon ??
    place.lng ??
    place.longitude ??
    place.location?.longitude;

  if (rawLatitude == null || rawLongitude == null) return null;

  const latitude = Number(rawLatitude);
  const longitude = Number(rawLongitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 || latitude > 90 ||
    longitude < -180 || longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
}

function parseDisplayTime(value) {
  if (!value) return null;

  const match = String(value).match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
  );

  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const suffix = match[3].toUpperCase();

  if (suffix === "AM" && hours === 12) hours = 0;
  if (suffix === "PM" && hours !== 12) hours += 12;

  return hours * 60 + minutes;
}

function formatDisplayMinutes(totalMinutes) {
  const safeMinutes =
    ((Math.round(totalMinutes) % 1440) + 1440) % 1440;

  const hours24 = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  const suffix = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;

  return `${hours12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function buildDrivingDirectionsUrl(origin, destination) {
  const url = new URL("https://www.google.com/maps/dir/");

  url.searchParams.set("api", "1");

  url.searchParams.set(
    "origin",
    `${origin.latitude},${origin.longitude}`
  );

  url.searchParams.set(
    "destination",
    `${destination.latitude},${destination.longitude}`
  );

  url.searchParams.set("travelmode", "driving");
  url.searchParams.set("dir_action", "navigate");

  return url.toString();
}

async function getDrivingRoute(origin, destination) {
  const coordinates =
    `${origin.longitude},${origin.latitude};` +
    `${destination.longitude},${destination.latitude}`;

  const url =
    `${ROUTING_API_URL}/${coordinates}?overview=false&steps=false`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Routing service returned HTTP ${response.status}`
    );
  }

  const data = await response.json();
  const leg = data?.routes?.[0]?.legs?.[0];

  if (data.code !== "Ok" || !leg) {
    throw new Error(
      data.message || "No driving route was found."
    );
  }

  return {
    durationMinutes: Math.max(
      1,
      Math.ceil(Number(leg.duration) / 60)
    ),
    distanceKm: Number(
      (Number(leg.distance) / 1000).toFixed(1)
    )
  };
}

// Calculate hotel-to-first-attraction and attraction-to-attraction
// routes for every day. After lunch, use the selected restaurant
// as the starting point when its coordinates are available.

async function attachTravelEstimates(
  generatedItinerary,
  selectedHotel
) {
  if (!generatedItinerary?.days) {
    return generatedItinerary;
  }

  const hotelCoordinates = getCoordinates(selectedHotel);

  const updatedDays = await Promise.all(
    generatedItinerary.days.map(async (day) => {
      const schedule = Array.isArray(day.schedule)
        ? day.schedule
        : [];

      const attractionIndexes = schedule
        .map((event, index) =>
          event.type === "attraction" ? index : -1
        )
        .filter((index) => index >= 0);

      if (attractionIndexes.length === 0) {
        return day;
      }

      const updatedSchedule = schedule.map(
        (event) => ({ ...event })
      );

      let previousAttraction = null;
      let previousAttractionIndex = -1;

      for (
        let attractionNumber = 0;
        attractionNumber < attractionIndexes.length;
        attractionNumber++
      ) {
        const eventIndex = attractionIndexes[attractionNumber];
        const attraction = updatedSchedule[eventIndex];
        const destination = getCoordinates(attraction);

        let origin = null;
        let fromName = "";
        let departureTime = null;
        let isHotelStart = false;

        // First attraction of each day starts from selected hotel.
        if (!previousAttraction) {
          if (hotelCoordinates) {
            origin = hotelCoordinates;
            fromName = selectedHotel.name || "Selected hotel";
            isHotelStart = true;
          }
        } else {
          const eventsBetween = updatedSchedule.slice(
            previousAttractionIndex + 1,
            eventIndex
          );

          const lunchBreak = [...eventsBetween]
            .reverse()
            .find((event) => event.type === "break");

          const restaurantCoordinates = getCoordinates(
            lunchBreak?.selectedRestaurant
          );

          const lunchFallbackCoordinates = getCoordinates(
            lunchBreak?.fallbackLocation
          );

          if (lunchBreak && restaurantCoordinates) {
            origin = restaurantCoordinates;

            fromName =
              lunchBreak.selectedRestaurant.name ||
              "Selected lunch restaurant";

            departureTime =
              lunchBreak.endTime ||
              previousAttraction.endTime;
          } else if (lunchBreak && lunchFallbackCoordinates) {
            origin = lunchFallbackCoordinates;

            fromName =
              `Lunch area near ${
                previousAttraction.name ||
                previousAttraction.title
              }`;

            departureTime =
              lunchBreak.endTime ||
              previousAttraction.endTime;
          } else {
            origin = getCoordinates(previousAttraction);

            fromName =
              previousAttraction.name ||
              previousAttraction.title ||
              "Previous attraction";

            departureTime = previousAttraction.endTime;
          }
        }

        if (!origin || !destination) {
          attraction.travelBefore = null;
          previousAttraction = attraction;
          previousAttractionIndex = eventIndex;
          continue;
        }

        const navigationUrl = buildDrivingDirectionsUrl(
          origin,
          destination
        );

        const targetStart = parseDisplayTime(
          attraction.startTime
        );

        try {
          const route = await getDrivingRoute(
            origin,
            destination
          );

          let estimatedDeparture;
          let estimatedArrival;
          let scheduleConflictMinutes = 0;
          let remainingBufferMinutes = 0;

          if (isHotelStart && targetStart !== null) {
            estimatedArrival = targetStart;
            estimatedDeparture =
              targetStart - route.durationMinutes;
          } else {
            const originTime = parseDisplayTime(departureTime);

            estimatedDeparture = originTime;

            estimatedArrival =
              originTime === null
                ? null
                : originTime + route.durationMinutes;

            if (
              estimatedArrival !== null &&
              targetStart !== null
            ) {
              scheduleConflictMinutes = Math.max(
                0,
                estimatedArrival - targetStart
              );

              remainingBufferMinutes = Math.max(
                0,
                targetStart - estimatedArrival
              );
            }
          }

          attraction.travelBefore = {
            available: true,
            fromName,
            toName:
              attraction.name ||
              attraction.title ||
              "Next attraction",
            durationMinutes: route.durationMinutes,
            distanceKm: route.distanceKm,
            departureTime:
              estimatedDeparture === null
                ? null
                : formatDisplayMinutes(estimatedDeparture),
            arrivalTime:
              estimatedArrival === null
                ? null
                : formatDisplayMinutes(estimatedArrival),
            plannedArrivalTime: attraction.startTime || null,
            scheduleConflictMinutes,
            remainingBufferMinutes,
            navigationUrl,
            mode: "driving",
            provider: "OpenStreetMap road data via OSRM"
          };
        } catch (routeError) {
          console.warn(
            `Could not calculate route to ${
              attraction.name || attraction.title
            }:`,
            routeError
          );

          attraction.travelBefore = {
            available: false,
            fromName,
            toName:
              attraction.name ||
              attraction.title ||
              "Next attraction",
            navigationUrl,
            mode: "driving",
            message:
              "Driving time is temporarily unavailable. You can still open the route in Google Maps."
          };
        }

        previousAttraction = attraction;
        previousAttractionIndex = eventIndex;
      }

      return {
        ...day,
        schedule: updatedSchedule
      };
    })
  );

  return {
    ...generatedItinerary,
    days: updatedDays,
    travelEstimates: {
      provider: "OpenStreetMap road data via OSRM",
      mode: "driving",
      includesLiveTraffic: false
    }
  };
}

// ==========================================
// NEARBY FOOD FINDER
// ==========================================

function NearbyFoodFinder({
  location,
  selectedRestaurant = null,
  onSelectRestaurant
}) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(
    selectedRestaurant || null
  );
  const [locationError, setLocationError] = useState("");

  async function findFood() {
    if (
      !location ||
      !Number.isFinite(Number(location.lat)) ||
      !Number.isFinite(Number(location.lon)) ||
      Number(location.lat) < -90 ||
      Number(location.lat) > 90 ||
      Number(location.lon) < -180 ||
      Number(location.lon) > 180
    ) {
      setError("A valid lunch location is not available.");
      return;
    }

    setLoading(true);
    setError("");
    setLocationError("");
    setSearched(true);
    setPlaces([]);
    setSelectedPlace(null);

    onSelectRestaurant?.(null);

    const latitude = Number(location.lat);
    const longitude = Number(location.lon);

    try {
      const response = await fetch(
        `${FOOD_API_URL}?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to find nearby food places."
        );
      }

      if (!Array.isArray(data.places)) {
        throw new Error(
          "The food service returned an invalid response."
        );
      }

      const results = data.places
        .filter(
          (place) =>
            Number.isFinite(Number(place.lat)) &&
            Number.isFinite(Number(place.lon))
        )
        .map((place, index) => ({
          id:
            place.id ||
            `${place.lat}-${place.lon}-${index}`,
          name: place.name || "Unnamed place",
          address: place.address || "",
          cuisine: place.cuisine || "",
          openingHours: place.openingHours || "",
          type: place.category || place.type || "food",
          lat: Number(place.lat),
          lon: Number(place.lon),
          distance: Number.isFinite(Number(place.distance))
            ? Number(place.distance)
            : 0,
          mapsUrl:
            place.mapsUrl ||
            `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, MAX_FOOD_RESULTS);

      setPlaces(results);
    } catch (searchError) {
      console.error(
        "Nearby food search failed:",
        searchError
      );

      setError(
        searchError.message ||
          "Food search is temporarily unavailable. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function navigateToSelectedPlace() {
    if (!selectedPlace) {
      setLocationError(
        "Please select a restaurant first."
      );
      return;
    }

    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError(
        "Your browser does not support current-location access."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLatitude =
          position.coords.latitude;

        const currentLongitude =
          position.coords.longitude;

        const url =
          "https://www.google.com/maps/dir/?api=1" +
          `&origin=${currentLatitude},${currentLongitude}` +
          `&destination=${selectedPlace.lat},${selectedPlace.lon}` +
          "&travelmode=walking";

        window.open(
          url,
          "_blank",
          "noopener,noreferrer"
        );
      },
      (geoError) => {
        console.error(
          "Location access failed:",
          geoError
        );

        if (geoError.code === 1) {
          setLocationError(
            "Location permission was denied. Allow location access in your browser and try again."
          );
        } else if (geoError.code === 2) {
          setLocationError(
            "Your current location could not be detected. Please try again."
          );
        } else {
          setLocationError(
            "Getting your location took too long. Please try again."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000
      }
    );
  }

  return (
    <div
      style={{
        marginTop: "14px",
        padding: "14px",
        borderRadius: "10px",
        background: "#f7f8fa"
      }}
    >
      <button
        type="button"
        onClick={findFood}
        disabled={loading}
        style={{
          padding: "10px 14px",
          border: "none",
          borderRadius: "7px",
          cursor: loading ? "wait" : "pointer",
          background: "#176b52",
          color: "#fff"
        }}
      >
        {loading
          ? "Finding food places..."
          : "Find food nearby"}
      </button>

      <p style={{ fontSize: "13px", marginBottom: "10px" }}>
        Searches for nearby restaurants, cafes and other places
        using the Geoapify places service.
      </p>

      {error && (
        <p role="alert" style={{ color: "#b42318" }}>
          {error}
        </p>
      )}

      {searched && !loading && !error && places.length === 0 && (
        <p>
          No nearby places were found. Try again later.
        </p>
      )}

      {places.map((place) => {
        const isSelected = selectedPlace?.id === place.id;

        return (
          <div
            key={place.id}
            style={{
              padding: "12px",
              marginTop: "10px",
              border: isSelected
                ? "2px solid #176b52"
                : "1px solid #ddd",
              borderRadius: "8px",
              background: "#fff"
            }}
          >
            <h4 style={{ margin: "0 0 6px" }}>
              {place.name}
            </h4>

            {place.address && (
              <p style={{ margin: "4px 0", fontSize: "14px" }}>
                {place.address}
              </p>
            )}

            <p style={{ margin: "4px 0", fontSize: "14px" }}>
              {place.cuisine
                ? `Cuisine: ${place.cuisine}`
                : "Cuisine not listed"}
            </p>

            <p style={{ margin: "4px 0", fontSize: "14px" }}>
              Type: {place.type.replace(/[_\.]/g, " ")}
            </p>

            <p style={{ margin: "4px 0", fontSize: "14px" }}>
              {place.distance.toFixed(2)} km away
            </p>

            {place.openingHours && (
              <p style={{ margin: "4px 0", fontSize: "14px" }}>
                Listed hours: {place.openingHours}
              </p>
            )}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginTop: "10px"
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setSelectedPlace(place);
                  onSelectRestaurant?.(place);
                  setLocationError("");
                }}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #176b52",
                  borderRadius: "6px",
                  background: isSelected
                    ? "#176b52"
                    : "#fff",
                  color: isSelected ? "#fff" : "#176b52",
                  cursor: "pointer"
                }}
              >
                {isSelected
                  ? "Place selected"
                  : "Select this place"}
              </button>

              <a
                href={place.mapsUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: "#e8f1ed",
                  color: "#176b52",
                  textDecoration: "none"
                }}
              >
                View on Google Maps
              </a>
            </div>
          </div>
        );
      })}

      {selectedPlace && (
        <div
          style={{
            marginTop: "14px",
            padding: "12px",
            borderRadius: "8px",
            background: "#e8f1ed"
          }}
        >
          <p style={{ marginTop: 0 }}>
            Selected place:{" "}
            <strong>{selectedPlace.name}</strong>
          </p>

          <button
            type="button"
            onClick={navigateToSelectedPlace}
            style={{
              padding: "10px 14px",
              border: "none",
              borderRadius: "7px",
              background: "#176b52",
              color: "#fff",
              cursor: "pointer"
            }}
          >
            Navigate from my current location
          </button>

          <p style={{ fontSize: "12px", marginBottom: 0 }}>
            Your browser will ask for location permission if needed.
            Google Maps will open walking directions to your selected place.
          </p>
        </div>
      )}

      {locationError && (
        <p role="alert" style={{ color: "#b42318" }}>
          {locationError}
        </p>
      )}

      <p style={{ fontSize: "12px", color: "#666", marginTop: "12px" }}>
        Place names, categories and addresses depend on available map data.
        Opening hours and food service may be unavailable or unverified.
      </p>
    </div>
  );
}

// ==========================================
// ITINERARY GENERATOR
// ==========================================

function ItineraryGenerator() {
  const navigate = useNavigate();

  const [destination, setDestination] = useState("Hyderabad");

  const [startDate, setStartDate] = useState(
    getLocalDateString(new Date())
  );

  const [endDate, setEndDate] = useState(
    getTomorrowDateString()
  );

  const [interests, setInterests] = useState([
    "history",
    "architecture"
  ]);

  const [journeyPlan, setJourneyPlan] = useState({
    outbound: {
      arrivalDateTime: ""
    },
    returnJourney: {
      departureDateTime: ""
    },
    restDurationMinutes: 120
  });

  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [savedTripId, setSavedTripId] = useState(null);
  const [nearbyHotels, setNearbyHotels] = useState([]);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [hotelError, setHotelError] = useState("");
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [travelLoading, setTravelLoading] = useState(false);
  const [travelError, setTravelError] = useState("");

  // ==========================================
  // LOAD HOTELS NEAR PLANNED ATTRACTIONS
  // ==========================================

  async function loadHotelsForItinerary(generatedItinerary) {
    const plannedAttractions = (
      generatedItinerary?.days || []
    )
      .flatMap((day) => day.schedule || [])
      .filter((item) => item.type === "attraction")
      .map((item) => ({
        name: item.name || item.title,
        coordinates: getAttractionCoordinates(
          item.name || item.title
        )
      }))
      .filter((item) => item.coordinates);

    const uniqueAttractions = Array.from(
      new Map(
        plannedAttractions.map((item) => [
          item.name.toLowerCase(),
          item
        ])
      ).values()
    );

    setNearbyHotels([]);
    setSelectedHotel(null);
    setHotelError("");

    if (uniqueAttractions.length === 0) {
      setHotelError(
        "Hotel suggestions are not available because this itinerary has no attractions with saved location coordinates."
      );
      return;
    }

    setHotelsLoading(true);

    try {
      const responses = await Promise.all(
        uniqueAttractions.map(async (attraction) => {
          const { latitude, longitude } =
            attraction.coordinates;

          const url = new URL(HOTELS_API_URL);

          url.searchParams.set("latitude", latitude);
          url.searchParams.set("longitude", longitude);
          url.searchParams.set(
            "radius",
            HOTEL_SEARCH_RADIUS_KM
          );

          const response = await fetch(url.toString());
          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || "Unable to load nearby hotels."
            );
          }

          if (!Array.isArray(data)) {
            throw new Error(
              "The hotel service returned an invalid response."
            );
          }

          return data.map((hotel) => ({
            ...hotel,
            nearestAttraction: attraction.name,
            nearestDistance:
              Number.isFinite(Number(hotel.distance))
                ? Number(hotel.distance)
                : null
          }));
        })
      );

      const hotelMap = new Map();

      responses.flat().forEach((hotel) => {
        const key = hotel.id || hotel._id || hotel.name;
        const existing = hotelMap.get(key);

        if (
          !existing ||
          (hotel.nearestDistance !== null &&
            (existing.nearestDistance === null ||
              hotel.nearestDistance < existing.nearestDistance))
        ) {
          hotelMap.set(key, hotel);
        }
      });

      const results = Array.from(
        hotelMap.values()
      ).sort((a, b) => {
        const distanceA =
          a.nearestDistance ?? Number.MAX_SAFE_INTEGER;

        const distanceB =
          b.nearestDistance ?? Number.MAX_SAFE_INTEGER;

        return distanceA - distanceB;
      });

      setNearbyHotels(results);

      if (results.length === 0) {
        setHotelError(
          `No hotels were found within ${HOTEL_SEARCH_RADIUS_KM} km of the planned sightseeing locations. This does not mean there are no hotels elsewhere in the destination.`
        );
      }
    } catch (requestError) {
      console.error(
        "Nearby hotel search failed:",
        requestError
      );

      setHotelError(
        requestError.message ||
          "Unable to load hotel suggestions right now."
      );
    } finally {
      setHotelsLoading(false);
    }
  }

  // ==========================================
  // HOTEL SELECTION AND ROUTE CALCULATION
  // ==========================================

  async function handleHotelSelect(hotel) {
    setSelectedHotel(hotel);
    setTravelLoading(true);
    setTravelError("");

    try {
      const updatedItinerary =
        await attachTravelEstimates(itinerary, hotel);

      setItinerary(updatedItinerary);
    } catch (routeError) {
      console.error(
        "Travel-time calculation failed:",
        routeError
      );

      setTravelError(
        "Travel-time estimates could not be loaded. Google Maps navigation links will still be available where coordinates exist."
      );
    } finally {
      setTravelLoading(false);
    }
  }

  // ==========================================
  // SAVE SELECTED RESTAURANT INTO LUNCH EVENT
  // ==========================================

  async function handleLunchRestaurantSelect(
    dayDate,
    scheduleIndex,
    restaurant
  ) {
    const currentItinerary = itinerary;

    if (!currentItinerary) return;

    const updatedBase = {
      ...currentItinerary,

      days: currentItinerary.days.map((day) => {
        if (day.date !== dayDate) return day;

        return {
          ...day,

          schedule: day.schedule.map((item, index) =>
            index === scheduleIndex
              ? {
                  ...item,
                  selectedRestaurant: restaurant
                }
              : item
          )
        };
      })
    };

    setItinerary(updatedBase);
    setTravelLoading(true);
    setTravelError("");

    try {
      const updatedWithRoutes =
        await attachTravelEstimates(
          updatedBase,
          selectedHotel
        );

      setItinerary(updatedWithRoutes);
    } catch (routeError) {
      console.error(
        "Travel-time refresh failed:",
        routeError
      );

      setTravelError(
        "The restaurant was selected, but travel times could not be refreshed."
      );
    } finally {
      setTravelLoading(false);
    }
  }

  // ==========================================
  // INTERESTS
  // ==========================================

  function handleInterestChange(value) {
    setInterests((current) =>
      current.includes(value)
        ? current.filter(
            (interest) => interest !== value
          )
        : [...current, value]
    );
  }

  // ==========================================
  // GENERATE ITINERARY
  // ==========================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSaveMessage("");
    setSavedTripId(null);
    setItinerary(null);
    setNearbyHotels([]);
    setSelectedHotel(null);
    setHotelError("");
    setTravelLoading(false);
    setTravelError("");

    if (!destination.trim()) {
      setError("Please select a destination.");
      return;
    }

    if (!startDate || !endDate || endDate < startDate) {
      setError("Please select valid travel dates.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError(
        "Please log in before generating your itinerary."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
          destination: destination.trim(),
          startDate,
          endDate,
          interests
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Your login session may have expired. Please log in again."
          );
        }

        throw new Error(
          data.message || "Unable to generate itinerary."
        );
      }

      setItinerary(data);

      setTravelLoading(true);

      try {
        const itineraryWithRoutes =
          await attachTravelEstimates(data, null);

        setItinerary(itineraryWithRoutes);
      } finally {
        setTravelLoading(false);
      }

      await loadHotelsForItinerary(data);
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // SAVE ITINERARY TO MY TRIPS
  // ==========================================

  async function handleSaveToMyTrips() {
    if (!itinerary) {
      setSaveMessage(
        "Generate an itinerary before saving."
      );
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setSaveMessage(
        "Please log in before saving your itinerary."
      );
      return;
    }

    setSaving(true);
    setSaveMessage("");
    setError("");

    try {
      const response = await fetch(SAVE_API_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
          destination: itinerary.destination,
          startDate: itinerary.startDate,
          endDate: itinerary.endDate,

          generatedItinerary: {
            ...itinerary,

            selectedHotel: selectedHotel
              ? {
                  id:
                    selectedHotel.id ||
                    selectedHotel._id,

                  name: selectedHotel.name,
                  address: selectedHotel.address,
                  price: selectedHotel.price,

                  nearestAttraction:
                    selectedHotel.nearestAttraction,

                  nearestDistance:
                    selectedHotel.nearestDistance,

                  distance:
                    selectedHotel.nearestDistance,

                  location:
                    selectedHotel.location || null,

                  latitude:
                    selectedHotel.location?.latitude ??
                    selectedHotel.latitude ??
                    null,

                  longitude:
                    selectedHotel.location?.longitude ??
                    selectedHotel.longitude ??
                    null,

                  mapsUrl:
                    selectedHotel.mapsUrl ||
                    selectedHotel.googleMapsUrl ||
                    null
                }
              : null
          },

          journeyPlan: {
            outbound: {
              arrivalDateTime:
                journeyPlan.outbound.arrivalDateTime
                  ? new Date(
                      journeyPlan.outbound.arrivalDateTime
                    ).toISOString()
                  : null
            },

            returnJourney: {
              departureDateTime:
                journeyPlan.returnJourney.departureDateTime
                  ? new Date(
                      journeyPlan.returnJourney.departureDateTime
                    ).toISOString()
                  : null
            },

            restDurationMinutes:
              journeyPlan.restDurationMinutes
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Your login session may have expired. Please log in again."
          );
        }

        throw new Error(
          data.message || "Unable to save the itinerary."
        );
      }

      if (!data.trip?._id) {
        throw new Error(
          "The server did not return the saved trip. Please check My Trips before trying again."
        );
      }

      setSavedTripId(data.trip._id);

      setSaveMessage(
        "Your itinerary has been saved to My Trips."
      );
    } catch (saveError) {
      console.error(
        "Save itinerary error:",
        saveError
      );

      setSaveMessage(
        saveError.message ||
          "Unable to save your itinerary."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="itinerary-page">
      <section className="itinerary-hero">
        <p className="itinerary-eyebrow">
          YOUR PERSONAL TRAVEL GUIDE
        </p>

        <h1>Plan your sightseeing</h1>

        <p>
          Choose your dates and interests. We'll create a day-by-day
          sightseeing schedule for you.
        </p>
      </section>

      <section className="itinerary-form-card">
        <h2>Trip details</h2>

        <form onSubmit={handleSubmit}>
          <div className="itinerary-form-grid">
            <div className="itinerary-field">
              <label htmlFor="itinerary-destination">
                Destination
              </label>

              <select
                id="itinerary-destination"
                value={destination}
                onChange={(event) =>
                  setDestination(event.target.value)
                }
              >
                <option value="Hyderabad">
                  Hyderabad
                </option>
              </select>
            </div>

            <div className="itinerary-field">
              <label htmlFor="itinerary-start-date">
                Start date
              </label>

              <input
                id="itinerary-start-date"
                type="date"
                value={startDate}
                onChange={(event) => {
                  const nextDate = event.target.value;

                  setStartDate(nextDate);

                  if (endDate < nextDate) {
                    setEndDate(nextDate);
                  }
                }}
                required
              />
            </div>

            <div className="itinerary-field">
              <label htmlFor="itinerary-end-date">
                End date
              </label>

              <input
                id="itinerary-end-date"
                type="date"
                min={startDate}
                value={endDate}
                onChange={(event) =>
                  setEndDate(event.target.value)
                }
                required
              />
            </div>
          </div>

          <fieldset className="itinerary-interests">
            <legend>Arrival and return details</legend>

            <p>
              Add your expected arrival time if you know it. If you leave it
              blank, sightseeing will be planned from the next day. You can
              also add your return departure time.
            </p>

            <div className="itinerary-form-grid">
              <div className="itinerary-field">
                <label htmlFor="journey-arrival-time">
                  Expected arrival date and time (optional)
                </label>

                <input
                  id="journey-arrival-time"
                  type="datetime-local"
                  value={journeyPlan.outbound.arrivalDateTime}
                  onChange={(event) =>
                    setJourneyPlan((current) => ({
                      ...current,

                      outbound: {
                        ...current.outbound,
                        arrivalDateTime: event.target.value
                      }
                    }))
                  }
                />
              </div>

              <div className="itinerary-field">
                <label htmlFor="journey-rest">
                  Rest after arrival
                </label>

                <select
                  id="journey-rest"
                  value={journeyPlan.restDurationMinutes}
                  onChange={(event) =>
                    setJourneyPlan((current) => ({
                      ...current,

                      restDurationMinutes: Number(
                        event.target.value
                      )
                    }))
                  }
                >
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                  <option value="180">3 hours</option>
                  <option value="240">4 hours</option>
                  <option value="480">8 hours</option>
                </select>
              </div>

              <div className="itinerary-field">
                <label htmlFor="journey-return-departure">
                  Return departure date and time (optional)
                </label>

                <input
                  id="journey-return-departure"
                  type="datetime-local"
                  value={
                    journeyPlan.returnJourney.departureDateTime
                  }
                  onChange={(event) =>
                    setJourneyPlan((current) => ({
                      ...current,

                      returnJourney: {
                        ...current.returnJourney,
                        departureDateTime: event.target.value
                      }
                    }))
                  }
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="itinerary-interests">
            <legend>What are you interested in?</legend>

            <p>Choose one or more interests.</p>

            <div className="itinerary-interest-options">
              {INTEREST_OPTIONS.map((interest) => (
                <label
                  className="itinerary-interest-option"
                  key={interest.value}
                >
                  <input
                    type="checkbox"
                    checked={interests.includes(interest.value)}
                    onChange={() =>
                      handleInterestChange(interest.value)
                    }
                  />

                  <span>{interest.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {error && (
            <div className="itinerary-error" role="alert">
              {error}
            </div>
          )}

          <button
            className="itinerary-generate-button"
            type="submit"
            disabled={loading || saving}
          >
            {loading
              ? "Generating itinerary..."
              : "Generate itinerary"}
          </button>
        </form>
      </section>

      {loading && (
        <div className="itinerary-loading" role="status">
          <p>Building your sightseeing schedule...</p>
        </div>
      )}

      {itinerary && !loading && (
        <section className="itinerary-results">
          <div className="itinerary-results-heading">
            <div>
              <p className="itinerary-eyebrow">
                YOUR GENERATED PLAN
              </p>

              <h2>{itinerary.destination} itinerary</h2>

              <p>
                {formatDate(itinerary.startDate)} –{" "}
                {formatDate(itinerary.endDate)}
              </p>
            </div>

            <div className="itinerary-day-count">
              <strong>{itinerary.days.length}</strong>
              <span>days</span>
            </div>
          </div>

          <div className="itinerary-notice">
            <strong>Planning estimates</strong>

            <p>
              Travel times are estimated driving times from road-map data.
              They do not include live traffic. Attraction opening hours
              may be unverified, so confirm them before visiting.
            </p>
          </div>

          {/* HOTEL RECOMMENDATIONS */}

          <section
            aria-labelledby="itinerary-hotels-heading"
            style={{
              marginTop: "28px",
              padding: "20px",
              border: "1px solid #d8e2e8",
              borderRadius: "12px",
              background: "#fff"
            }}
          >
            <h2
              id="itinerary-hotels-heading"
              style={{
                marginTop: 0,
                marginBottom: "8px"
              }}
            >
              Hotel Recommendations
            </h2>

            <p style={{ color: "#52616b" }}>
              Choose accommodation close to the attractions in your travel itinerary.
              We use your selected hotel as the starting point for the first attraction each day.
            </p>

            {hotelsLoading && (
              <p role="status">
                Finding hotels near your planned attractions...
              </p>
            )}

            {hotelError && (
              <p
                role="status"
                style={{ color: "#9a3412" }}
              >
                {hotelError}
              </p>
            )}

            {!hotelsLoading && nearbyHotels.length > 0 && (
              <div style={{ display: "grid", gap: "12px" }}>
                {nearbyHotels.map((hotel) => {
                  const hotelId =
                    hotel.id || hotel._id || hotel.name;

                  const isSelected =
                    (
                      selectedHotel?.id ||
                      selectedHotel?._id ||
                      selectedHotel?.name
                    ) === hotelId;

                  const hotelAddress =
                    hotel.address ||
                    hotel.location?.address ||
                    "Address not provided";

                  return (
                    <label
                      key={hotelId}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        padding: "14px",
                        border: isSelected
                          ? "2px solid #176b52"
                          : "1px solid #d5dde3",
                        borderRadius: "9px",
                        background: isSelected
                          ? "#f0faf6"
                          : "#fff",
                        cursor: "pointer"
                      }}
                    >
                      <input
                        type="radio"
                        name="selected-itinerary-hotel"
                        checked={Boolean(isSelected)}
                        onChange={() => handleHotelSelect(hotel)}
                        style={{ marginTop: "4px" }}
                      />

                      <span style={{ flex: 1 }}>
                        <strong
                          style={{
                            display: "block",
                            marginBottom: "4px"
                          }}
                        >
                          {hotel.name}
                        </strong>

                        <span
                          style={{
                            display: "block",
                            color: "#52616b",
                            fontSize: "14px"
                          }}
                        >
                          {hotelAddress}
                        </span>

                        <span
                          style={{
                            display: "block",
                            marginTop: "7px",
                            fontWeight: 700
                          }}
                        >
                          {formatHotelPrice(hotel)}
                        </span>

                        {hotel.nearestDistance !== null && (
                          <span
                            style={{
                              display: "block",
                              marginTop: "4px",
                              color: "#52616b",
                              fontSize: "13px"
                            }}
                          >
                            {hotel.nearestDistance.toFixed(2)} km from{" "}
                            {hotel.nearestAttraction}
                          </span>
                        )}

                        {Array.isArray(hotel.amenities) &&
                          hotel.amenities.length > 0 && (
                            <span
                              style={{
                                display: "block",
                                marginTop: "5px",
                                color: "#52616b",
                                fontSize: "13px"
                              }}
                            >
                              {hotel.amenities.slice(0, 4).join(" · ")}
                            </span>
                          )}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {selectedHotel && (
              <p
                role="status"
                style={{
                  marginBottom: 0,
                  color: "#176b52"
                }}
              >
                Selected: <strong>{selectedHotel.name}</strong>. This choice
                will be saved with your trip.
              </p>
            )}

            {travelLoading && (
              <p
                role="status"
                style={{
                  marginBottom: 0,
                  color: "#176b52"
                }}
              >
                Calculating driving times from your hotel and between planned places...
              </p>
            )}

            {travelError && (
              <p
                role="status"
                style={{
                  marginBottom: 0,
                  color: "#9a3412"
                }}
              >
                {travelError}
              </p>
            )}

            <p
              style={{
                fontSize: "12px",
                color: "#667085",
                marginBottom: 0
              }}
            >
              Prices are estimates from the project's hotel dataset.
              Travel times are estimated driving times based on road-map
              data and do not include live traffic. Select a hotel to
              calculate the hotel-to-first-attraction route for each day.
              Selecting a hotel does not make a booking.
            </p>
          </section>

          {/* DAILY ITINERARY */}

          {itinerary.days.map((day) => {
            const attractions = day.schedule.filter(
              (item) => item.type === "attraction"
            );

            const sightseeingMinutes = attractions.reduce(
              (total, item) =>
                total + (item.durationMinutes || 0),
              0
            );

            return (
              <article
                className="itinerary-day-card"
                key={day.date}
              >
                <header className="itinerary-day-header">
                  <div>
                    <span className="itinerary-day-label">
                      DAY {day.day}
                    </span>

                    <h3>{formatDate(day.date)}</h3>
                  </div>

                  <div className="itinerary-day-summary">
                    <strong>
                      {formatDuration(sightseeingMinutes)}
                    </strong>

                    <span>sightseeing</span>
                  </div>
                </header>

                {day.schedule.length === 0 ? (
                  <p className="itinerary-empty-day">
                    No attractions could be scheduled for this day.
                  </p>
                ) : (
                  <div className="itinerary-timeline">
                    {day.schedule.map((item, index) => (
                      <div
                        className={`itinerary-event itinerary-event-${item.type}`}
                        key={`${day.date}-${item.type}-${item.title}-${index}`}
                      >
                        <div className="itinerary-event-marker">
                          {item.type === "attraction"
                            ? "📍"
                            : item.type === "travel"
                              ? "🚗"
                              : "🍽️"}
                        </div>

                        <div className="itinerary-event-content">
                          <div className="itinerary-event-time">
                            {formatTime(item.startTime)}
                            {item.endTime &&
                              ` – ${formatTime(item.endTime)}`}
                          </div>

                          <h4>
                            {item.type === "attraction"
                              ? item.name || item.title
                              : item.title}
                          </h4>

                          {/* TRAVEL BEFORE EACH ATTRACTION */}

                          {item.type === "attraction" &&
                            item.travelBefore && (
                              <div
                                className="itinerary-travel-leg"
                                style={{
                                  margin: "10px 0 12px",
                                  padding: "12px",
                                  border: "1px solid #d8e8ef",
                                  borderRadius: "9px",
                                  background: "#f4f9fc"
                                }}
                              >
                                <strong
                                  style={{
                                    display: "block",
                                    color: "#17324D",
                                    fontSize: "13px"
                                  }}
                                >
                                  🚗 Travel:{" "}
                                  {item.travelBefore.fromName} →{" "}
                                  {item.travelBefore.toName}
                                </strong>

                                {item.travelBefore.available ? (
                                  <>
                                    <p
                                      style={{
                                        margin: "6px 0",
                                        color: "#52616b",
                                        fontSize: "13px"
                                      }}
                                    >
                                      Estimated driving time:{" "}
                                      <strong>
                                        {formatDuration(
                                          item.travelBefore.durationMinutes
                                        )}
                                      </strong>

                                      {item.travelBefore.distanceKm != null &&
                                        ` · ${item.travelBefore.distanceKm} km`}
                                    </p>

                                    {item.travelBefore.departureTime &&
                                      item.travelBefore.arrivalTime && (
                                        <p
                                          style={{
                                            margin: "4px 0",
                                            color: "#52616b",
                                            fontSize: "12px"
                                          }}
                                        >
                                          {item.travelBefore.fromName ===
                                          selectedHotel?.name
                                            ? `Leave hotel at ${item.travelBefore.departureTime}`
                                            : `Leave at ${item.travelBefore.departureTime}`}
                                          {` · Estimated arrival ${item.travelBefore.arrivalTime}`}
                                        </p>
                                      )}

                                    {item.travelBefore.scheduleConflictMinutes > 0 && (
                                      <p
                                        style={{
                                          margin: "6px 0",
                                          color: "#b42318",
                                          fontSize: "12px",
                                          fontWeight: 700
                                        }}
                                      >
                                        This route may delay the planned visit
                                        by about{" "}
                                        {formatDuration(
                                          item.travelBefore.scheduleConflictMinutes
                                        )}. The day's schedule may need adjustment.
                                      </p>
                                    )}
                                  </>
                                ) : (
                                  <p
                                    style={{
                                      margin: "6px 0",
                                      color: "#805b00",
                                      fontSize: "12px"
                                    }}
                                  >
                                    {item.travelBefore.message ||
                                      "Driving time is currently unavailable."}
                                  </p>
                                )}

                                {item.travelBefore.navigationUrl && (
                                  <a
                                    href={item.travelBefore.navigationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: "inline-block",
                                      marginTop: "4px",
                                      color: "#1769aa",
                                      fontSize: "13px",
                                      fontWeight: 700,
                                      textDecoration: "none"
                                    }}
                                  >
                                    Navigate to this place in Google Maps →
                                  </a>
                                )}
                              </div>
                            )}

                          {item.type === "attraction" && (
                            <>
                              <p>
                                {item.category ||
                                  item.description ||
                                  "Sightseeing"}
                                {" · "}
                                {formatDuration(
                                  item.estimatedVisitMinutes ||
                                    item.durationMinutes ||
                                    0
                                )}
                              </p>

                              {!(
                                item.openingHoursVerified ??
                                item.hoursVerified
                              ) && (
                                <span className="itinerary-unverified">
                                  Opening hours unverified
                                </span>
                              )}
                            </>
                          )}

                          {item.type === "travel" && (
                            <p>
                              Estimated travel buffer:{" "}
                              {formatDuration(item.durationMinutes)}
                            </p>
                          )}

                          {item.type === "break" && (
                            <>
                              <p>
                                {formatDuration(
                                  item.durationMinutes || 45
                                )}
                              </p>

                              <NearbyFoodFinder
                                location={item.fallbackLocation}
                                selectedRestaurant={
                                  item.selectedRestaurant || null
                                }
                                onSelectRestaurant={(restaurant) =>
                                  handleLunchRestaurantSelect(
                                    day.date,
                                    index,
                                    restaurant
                                  )
                                }
                              />
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <footer className="itinerary-day-footer">
                  <span>
                    Attractions planned: {attractions.length}
                  </span>

                  <span>
                    Sightseeing: {formatDuration(sightseeingMinutes)}
                  </span>
                </footer>
              </article>
            );
          })}

          {itinerary.unplannedAttractions?.length > 0 && (
            <section className="itinerary-unplanned-section">
              <h3>Attractions not included</h3>

              <ul>
                {itinerary.unplannedAttractions.map((attraction) => (
                  <li key={attraction.id || attraction.name}>
                    <strong>{attraction.name}</strong>
                    <span>{attraction.reason}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* SAVE TO MY TRIPS */}

          <section
            style={{
              marginTop: "24px",
              padding: "20px",
              borderRadius: "12px",
              background: "#10283A",
              color: "#fff"
            }}
          >
            <h3 style={{ marginTop: 0 }}>
              Keep this travel plan
            </h3>

            <p>
              Save your generated itinerary to your account so you can
              access it from My Trips.
            </p>

            <button
              type="button"
              onClick={handleSaveToMyTrips}
              disabled={
                saving ||
                travelLoading ||
                Boolean(savedTripId)
              }
              style={{
                padding: "12px 20px",
                border: "none",
                borderRadius: "8px",
                background: savedTripId
                  ? "#64748b"
                  : "#35dfc1",
                color: "#071421",
                fontWeight: "700",
                cursor:
                  saving || travelLoading || savedTripId
                    ? "not-allowed"
                    : "pointer",
                opacity: saving || travelLoading ? 0.7 : 1
              }}
            >
              {travelLoading
                ? "Calculating travel times..."
                : saving
                  ? "Saving itinerary..."
                  : savedTripId
                    ? "Saved to My Trips"
                    : "Save to My Trips"}
            </button>

            {saveMessage && (
              <p
                role="status"
                style={{
                  marginTop: "12px",
                  color: savedTripId
                    ? "#8fffe8"
                    : "#ffd0d0"
                }}
              >
                {saveMessage}
              </p>
            )}

            {savedTripId && (
              <button
                type="button"
                onClick={() => navigate("/trips")}
                style={{
                  marginTop: "8px",
                  display: "block",
                  padding: "10px 0",
                  border: "none",
                  background: "transparent",
                  color: "#8fffe8",
                  textDecoration: "underline",
                  cursor: "pointer"
                }}
              >
                Go to My Trips →
              </button>
            )}
          </section>
        </section>
      )}
    </main>
  );
}

export default ItineraryGenerator;
