import API_BASE_URL from "../config/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import HotelMap from "../components/HotelMap";
import "./Hotels.css";

const API_BASE = API_BASE_URL;
const SEARCH_RADII_KM = [5, 10, 20];

function Hotels() {
  const [searchParams] = useSearchParams();

  const attractionId = searchParams.get("attractionId");
  const queryDestinationId = searchParams.get("destinationId");

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [destinationId, setDestinationId] = useState(
    queryDestinationId || ""
  );
  const [cityName, setCityName] = useState("");
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [searchRadius, setSearchRadius] = useState(5);

  const [minimumPrice, setMinimumPrice] = useState("0");
  const [maximumPrice, setMaximumPrice] = useState("50000");
  const [minimumRating, setMinimumRating] = useState("0");
  const [maximumDistance, setMaximumDistance] = useState("20");
  const [sortBy, setSortBy] = useState("distance");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pageError, setPageError] = useState("");

  const loadNearbyHotels = useCallback(async (place) => {
    if (
      place?.latitude == null ||
      place?.longitude == null
    ) {
      setError(
        "This attraction does not have valid location coordinates."
      );
      setHotels([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setHotels([]);
    setSelectedHotel(null);
    setSearchRadius(5);

    try {
      let foundHotels = [];
      let successfulSearch = false;
      let lastError = null;

      for (const radius of SEARCH_RADII_KM) {
        try {
          const response = await fetch(
            `${API_BASE}/api/hotels?latitude=${encodeURIComponent(
              place.latitude
            )}&longitude=${encodeURIComponent(
              place.longitude
            )}&radius=${radius}`
          );

          if (!response.ok) {
            throw new Error(
              "Failed to fetch nearby hotels."
            );
          }

          const data = await response.json();

          if (!Array.isArray(data)) {
            throw new Error(
              "The hotel service returned an unexpected response."
            );
          }

          successfulSearch = true;
          foundHotels = data;
          setSearchRadius(radius);

          if (data.length > 0) {
            break;
          }
        } catch (requestError) {
          lastError = requestError;
          break;
        }
      }

      if (lastError) {
        throw lastError;
      }

      if (!successfulSearch) {
        throw new Error(
          "Unable to complete the nearby hotel search."
        );
      }

      setHotels(foundHotels);
    } catch (err) {
      console.error("Hotel search error:", err);
      setError(
        err.message ||
        "Unable to load nearby hotels. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSelectedAttraction() {
      setLoading(true);
      setPageError("");
      setError("");
      setSelectedPlace(null);
      setHotels([]);
      setSelectedHotel(null);

      if (!attractionId) {
        setLoading(false);
        setPageError(
          "Please open this page using the Find Nearby Hotels option on an attraction details page."
        );
        return;
      }

      try {
        const attractionResponse = await fetch(
          `${API_BASE}/api/activities/${encodeURIComponent(
            attractionId
          )}`
        );

        if (!attractionResponse.ok) {
          throw new Error(
            "The selected attraction could not be found."
          );
        }

        const attraction = await attractionResponse.json();

        if (cancelled) return;

        if (
          attraction.latitude == null ||
          attraction.longitude == null
        ) {
          throw new Error(
            "Location coordinates are not available for this attraction."
          );
        }

        let resolvedDestinationId = queryDestinationId || "";

        if (!resolvedDestinationId) {
          const destinationsResponse = await fetch(
            `${API_BASE}/api/destinations`
          );

          if (destinationsResponse.ok) {
            const destinations =
              await destinationsResponse.json();

            const matchingDestination = destinations.find(
              (destination) =>
                destination.name?.trim().toLowerCase() ===
                attraction.destination?.trim().toLowerCase()
            );

            resolvedDestinationId =
              matchingDestination?._id || "";
          }
        }

        if (cancelled) return;

        setDestinationId(resolvedDestinationId);
        setCityName(attraction.destination || "");
        setSelectedPlace(attraction);

        await loadNearbyHotels(attraction);
      } catch (err) {
        console.error("Attraction loading error:", err);

        if (!cancelled) {
          setPageError(
            err.message ||
            "Unable to load the selected attraction."
          );
          setLoading(false);
        }
      }
    }

    loadSelectedAttraction();

    return () => {
      cancelled = true;
    };
  }, [
    attractionId,
    queryDestinationId,
    loadNearbyHotels
  ]);

  const hotelBackLink = selectedPlace
    ? `/activities/${selectedPlace.id ?? selectedPlace._id}`
    : "/";

  const filteredHotels = useMemo(() => {
    const minPrice = Number(minimumPrice) || 0;
    const maxPrice = Number(maximumPrice) || 50000;
    const minRating = Number(minimumRating) || 0;
    const maxDistance = Number(maximumDistance || searchRadius);

    const priceFilterActive =
      minPrice > 0 || maxPrice < 50000;

    const result = hotels.filter((hotel) => {
      const price =
        hotel.price?.amount != null &&
        Number.isFinite(Number(hotel.price.amount))
          ? Number(hotel.price.amount)
          : null;

      const rating =
        hotel.rating != null &&
        Number.isFinite(Number(hotel.rating))
          ? Number(hotel.rating)
          : null;

      const distance =
        hotel.distance != null &&
        Number.isFinite(Number(hotel.distance))
          ? Number(hotel.distance)
          : null;

      if (
        priceFilterActive &&
        (price === null || price < minPrice || price > maxPrice)
      ) {
        return false;
      }

      if (
        minRating > 0 &&
        (rating === null || rating < minRating)
      ) {
        return false;
      }

      if (
        distance !== null &&
        distance > maxDistance
      ) {
        return false;
      }

      return true;
    });

    result.sort((a, b) => {
      if (
        sortBy === "price-low-high" ||
        sortBy === "price-high-low"
      ) {
        const priceA =
          a.price?.amount != null
            ? Number(a.price.amount)
            : Infinity;

        const priceB =
          b.price?.amount != null
            ? Number(b.price.amount)
            : Infinity;

        return sortBy === "price-low-high"
          ? priceA - priceB
          : priceB - priceA;
      }

      const distanceA =
        a.distance != null
          ? Number(a.distance)
          : Infinity;

      const distanceB =
        b.distance != null
          ? Number(b.distance)
          : Infinity;

      return distanceA - distanceB;
    });

    return result;
  }, [
    hotels,
    minimumPrice,
    maximumPrice,
    minimumRating,
    maximumDistance,
    sortBy,
    searchRadius
  ]);

  function resetFilters() {
    setMinimumPrice("0");
    setMaximumPrice("50000");
    setMinimumRating("0");
    setMaximumDistance(String(searchRadius));
    setSortBy("distance");
  }

  if (pageError) {
    return (
      <main className="hotels-page">
        <header className="hotels-header">
          <p className="eyebrow">
            TRAVEL EXPLORER · STAYS
          </p>
          <h1>Nearby Hotels</h1>
        </header>

        <section className="hotel-selection-empty">
          <h2>Choose an attraction first</h2>
          <p>{pageError}</p>
          <Link
            to="/"
            className="hotel-destination-back"
          >
            ← Back to Explore
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="hotels-page">
      <header className="hotels-header">
        <p className="eyebrow">
          TRAVEL EXPLORER · STAYS
        </p>

        <h1>
          {selectedPlace
            ? `Hotels Near ${selectedPlace.name}`
            : "Finding Your Nearby Stay"}
        </h1>

        <p>
          {selectedPlace
            ? `Explore hotels near ${selectedPlace.name}, ${cityName}.`
            : "Loading your selected attraction..."}
        </p>

        <p className="hotel-data-notice">
          Prices are illustrative estimates where provided.
          Hotel availability has not been checked.
          Bookings in this project are demonstrations.
        </p>
      </header>

      {selectedPlace && (
        <div className="selected-attraction">
          <div>
            <p className="eyebrow">YOUR SELECTED PLACE</p>
            <h2>{selectedPlace.name}</h2>
            <p>{selectedPlace.description}</p>
            <span>
              Searching within {searchRadius} km
            </span>
          </div>

          <Link
            to={hotelBackLink}
            className="change-attraction-button"
          >
            ← Back to Attraction
          </Link>
        </div>
      )}

      {loading ? (
        <div className="hotel-search-message">
          <p>
            Finding hotels near{" "}
            {selectedPlace?.name || "your attraction"}...
          </p>
        </div>
      ) : error ? (
        <div className="no-hotels">
          <h2>Hotel search failed</h2>
          <p>{error}</p>

          {selectedPlace && (
            <button
              type="button"
              className="change-attraction-button"
              onClick={() => loadNearbyHotels(selectedPlace)}
            >
              Try Again
            </button>
          )}
        </div>
      ) : hotels.length > 0 ? (
        <div className="hotels-content">
          <section className="hotel-map-section">
            <div className="hotel-map-header">
              <div>
                <h2>Explore on Map</h2>
                <p>
                  Select a hotel to highlight its location.
                </p>
              </div>
            </div>

            <div className="hotel-map-container">
              <HotelMap
                hotels={filteredHotels}
                latitude={selectedPlace.latitude}
                longitude={selectedPlace.longitude}
                selectedHotel={selectedHotel}
                radiusKm={Number(maximumDistance) || searchRadius}
                destinationName={selectedPlace.name}
              />
            </div>
          </section>

          <section className="hotel-results">
            <div className="hotel-results-header">
              <h2>Nearby Hotels</h2>
              <span>
                {filteredHotels.length} of {hotels.length} found
              </span>
            </div>

            <section
              style={{
                margin: "20px 0 26px",
                padding: "22px",
                background: "#F7F6F2",
                border: "1px solid #e5e1d8",
                borderRadius: "12px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "18px"
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    color: "#244C3E"
                  }}
                >
                  Filter and Sort
                </h3>

                <button
                  type="button"
                  onClick={resetFilters}
                  style={{
                    border: "1px solid #244C3E",
                    borderRadius: "6px",
                    padding: "8px 13px",
                    background: "transparent",
                    color: "#244C3E",
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                >
                  Reset filters
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "16px"
                }}
              >
                <label style={filterLabelStyle}>
                  <span>Minimum price (₹)</span>
                  <input
                    type="number"
                    min="0"
                    value={minimumPrice}
                    onChange={(event) =>
                      setMinimumPrice(event.target.value)
                    }
                    style={filterInputStyle}
                  />
                </label>

                <label style={filterLabelStyle}>
                  <span>Maximum price (₹)</span>
                  <input
                    type="number"
                    min="0"
                    value={maximumPrice}
                    onChange={(event) =>
                      setMaximumPrice(event.target.value)
                    }
                    style={filterInputStyle}
                  />
                </label>

                <label style={filterLabelStyle}>
                  <span>Minimum rating</span>
                  <select
                    value={minimumRating}
                    onChange={(event) =>
                      setMinimumRating(event.target.value)
                    }
                    style={filterInputStyle}
                  >
                    <option value="0">Any rating</option>
                    <option value="3">3+ stars</option>
                    <option value="3.5">3.5+ stars</option>
                    <option value="4">4+ stars</option>
                    <option value="4.5">4.5+ stars</option>
                  </select>
                </label>

                <label style={filterLabelStyle}>
                  <span>Maximum distance</span>
                  <select
                    value={maximumDistance}
                    onChange={(event) =>
                      setMaximumDistance(event.target.value)
                    }
                    style={filterInputStyle}
                  >
                    <option value="1">Within 1 km</option>
                    <option value="2">Within 2 km</option>
                    <option value="3">Within 3 km</option>
                    <option value="4">Within 4 km</option>
                    <option value="5">Within 5 km</option>
                    <option value="10">Within 10 km</option>
                    <option value="15">Within 15 km</option>
                    <option value="20">Within 20 km</option>
                  </select>
                </label>

                <label style={filterLabelStyle}>
                  <span>Sort by</span>
                  <select
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(event.target.value)
                    }
                    style={filterInputStyle}
                  >
                    <option value="distance">Nearest first</option>
                    <option value="price-low-high">
                      Price: low to high
                    </option>
                    <option value="price-high-low">
                      Price: high to low
                    </option>
                  </select>
                </label>
              </div>

              <p
                style={{
                  margin: "14px 0 0",
                  color: "#6b6b63",
                  fontSize: "0.85rem"
                }}
              >
                Hotels without price or rating information may
                be excluded when you apply those specific filters.
              </p>
            </section>

            {filteredHotels.length > 0 ? (
              <div className="hotel-list">
                {filteredHotels.map((hotel) => {
                  const hasPrice =
                    hotel.price?.amount != null &&
                    Number.isFinite(Number(hotel.price.amount));

                  const hotelId = hotel.id ?? hotel._id;

                  const isSelected =
                    selectedHotel != null &&
                    String(selectedHotel.id ?? selectedHotel._id) ===
                      String(hotelId);

                  return (
                    <article
                      className={`hotel-card ${
                        isSelected ? "selected" : ""
                      }`}
                      key={hotelId}
                      onClick={() => setSelectedHotel(hotel)}
                    >
                      <div className="hotel-card-content">
                        <div className="hotel-card-header">
                          <h2>{hotel.name}</h2>

                          <span className="hotel-rating">
                            {hotel.rating != null
                              ? `⭐ ${hotel.rating}`
                              : "Rating not available"}
                          </span>
                        </div>

                        <p className="hotel-distance">
                          📍 {hotel.address || hotel.destination}
                        </p>

                        <p className="hotel-distance">
                          {Number.isFinite(Number(hotel.distance))
                            ? `${Number(hotel.distance).toFixed(2)} km away`
                            : "Distance not available"}
                        </p>

                        <p className="hotel-reviews">
                          {hotel.reviewCount != null
                            ? `${Number(
                                hotel.reviewCount
                              ).toLocaleString()} reviews`
                            : "Reviews not available"}
                        </p>

                        <div className="hotel-price">
                          {hasPrice ? (
                            <>
                              <strong>
                                ₹
                                {Number(
                                  hotel.price.amount
                                ).toLocaleString("en-IN")}
                              </strong>

                              <span>
                                / {hotel.price.period || "per night"}
                              </span>
                            </>
                          ) : (
                            <strong className="hotel-price-unavailable">
                              Price not available
                            </strong>
                          )}
                        </div>

                        {hasPrice && (
                          <p className="hotel-estimate-label">
                            Estimated price only — actual rates may differ.
                          </p>
                        )}

                        <div className="hotel-amenities">
                          {Array.isArray(hotel.amenities) &&
                            hotel.amenities.map((amenity) => (
                              <span key={amenity}>
                                {amenity}
                              </span>
                            ))}
                        </div>

                        <div className="hotel-card-footer">
                          <span className="availability-unknown">
                            ● Availability not checked
                          </span>

                          <Link
                            to={
                              `/hotels/${hotelId}` +
                              `?latitude=${selectedPlace.latitude}` +
                              `&longitude=${selectedPlace.longitude}` +
                              `&destinationId=${destinationId}`
                            }
                            className="hotel-view-button"
                            onClick={(event) =>
                              event.stopPropagation()
                            }
                          >
                            View Hotel
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="no-hotels">
                <h2>No hotels match these filters</h2>
                <p>
                  Try increasing your price range or distance,
                  or lowering the minimum rating.
                </p>
                <button
                  type="button"
                  className="change-attraction-button"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="no-hotels">
          <h2>No nearby hotels found</h2>
          <p>
            We searched within 5 km, 10 km and 20 km of{" "}
            {selectedPlace?.name}, but no hotels were returned.
            You can go back to the attraction or try the search
            again later.
          </p>

          {selectedPlace && (
            <button
              type="button"
              className="change-attraction-button"
              onClick={() => loadNearbyHotels(selectedPlace)}
            >
              Search Again
            </button>
          )}
        </div>
      )}
    </main>
  );
}

const filterLabelStyle = {
  display: "grid",
  gap: "7px",
  color: "#252723"
};

const filterInputStyle = {
  width: "100%",
  minHeight: "42px",
  padding: "9px 11px",
  border: "1px solid #d5d0c5",
  borderRadius: "6px",
  background: "#ffffff",
  color: "#252723",
  font: "inherit"
};

export default Hotels;