import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./MyTrips.css";

function getSelectedLunchRestaurants(trip) {
  const days = trip?.generatedItinerary?.days || [];

  return days.flatMap((day, dayIndex) => {
    const schedule = Array.isArray(day.schedule) ? day.schedule : [];

    return schedule
      .filter((event) => event.type === "break" && event.selectedRestaurant)
      .map((event, eventIndex) => ({
        day: day.day || dayIndex + 1,
        date: day.date,
        startTime: event.startTime,
        endTime: event.endTime,
        restaurant: event.selectedRestaurant,
        key: `${day.date || dayIndex}-${eventIndex}`
      }));
  });
}

function getTripAttractions(trip) {
  const days = trip?.generatedItinerary?.days || [];

  return days.flatMap((day, dayIndex) => {
    const events = Array.isArray(day.schedule) ? day.schedule : [];
    const places = events
      .filter((event) => event.type === "attraction")
      .map((event) => event.name || event.title)
      .filter(Boolean);

    return places.length
      ? [{ day: day.day || dayIndex + 1, date: day.date, places }]
      : [];
  });
}

function getSelectedHotel(trip) {
  return trip?.generatedItinerary?.selectedHotel || trip?.selectedHotel || null;
}

function getHotelPrice(hotel) {
  return hotel?.price?.amount ??
    hotel?.price?.value ??
    hotel?.estimatedPrice ??
    hotel?.pricePerNight ??
    null;
}

function formatTripDate(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function MyTrips() {
  const [trips, setTrips] = useState([]);

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    fetchTrips();
  }, []);

  async function fetchTrips() {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in to view your trips.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/trips",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch trips"
        );
      }

      setTrips(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load your trips.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTrip(event) {
    event.preventDefault();

    setCreateError("");

    if (!title.trim()) {
      setCreateError("Please enter a trip title.");
      return;
    }

    if (!destination.trim()) {
      setCreateError(
        "Please enter a destination."
      );
      return;
    }

    setCreating(true);

    const token = localStorage.getItem("token");

    if (!token) {
      setCreateError("Please log in first.");
      setCreating(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/trips",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            title,
            destination,
            startDate,
            endDate,
            notes
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create trip"
        );
      }

      setTrips((currentTrips) => [
        data,
        ...currentTrips
      ]);

      setTitle("");
      setDestination("");
      setStartDate("");
      setEndDate("");
      setNotes("");

      // Scroll back to the trip list
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    } catch (error) {
      console.error(error);
      setCreateError(error.message);
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <main className="trips-page-state">
        <div className="trips-spinner"></div>

        <p>Loading your adventures...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="trips-page-state">
        <span className="trips-state-icon">
          🧳
        </span>

        <h2>Let's get you travelling</h2>

        <p>{error}</p>

        <Link
          to="/login"
          className="trips-login-button"
        >
          Go to Login
        </Link>
      </main>
    );
  }

  return (
    <main className="my-trips-page">
      {/* Page hero */}

      <section className="trips-hero">
        <div>
          <span className="trips-label">
            YOUR JOURNEYS
          </span>

          <h1>
            Plan your next
            <span> adventure.</span>
          </h1>

          <p>
            Keep your destinations, dates, notes
            and travel plans organized in one place.
          </p>
        </div>

        <a
          href="#create-trip"
          className="new-trip-button"
        >
          <span>＋</span>
          New Trip
        </a>
      </section>

      {/* Trip list */}

      <section className="trips-list-section">
        <div className="trips-section-heading">
          <div>
            <span className="trips-label">
              YOUR TRAVEL PLANS
            </span>

            <h2>
              {trips.length === 0
                ? "No journeys yet"
                : "Your adventures"}
            </h2>
          </div>

          <span className="trip-count">
            {trips.length}{" "}
            {trips.length === 1
              ? "trip"
              : "trips"}
          </span>
        </div>

        {trips.length === 0 ? (
          <div className="empty-trips">
            <div className="empty-trip-icon">
              🧭
            </div>

            <h3>
              Your next adventure starts here
            </h3>

            <p>
              Create your first trip and start
              building your itinerary.
            </p>

            <a
              href="#create-trip"
              className="empty-trip-button"
            >
              Create My First Trip →
            </a>
          </div>
        ) : (
          <div className="trip-list">
            {trips.map((trip, index) => {
              const lunchRestaurants = getSelectedLunchRestaurants(trip);
              const attractionDays = getTripAttractions(trip);
              const selectedHotel = getSelectedHotel(trip);
              const hotelPrice = getHotelPrice(selectedHotel);

              return (
              <article
                className="trip-card"
                key={trip._id}
              >
                <div
                  className={`trip-card-visual trip-visual-${index % 4}`}
                >
                  <span className="trip-visual-icon">
                    {index % 4 === 0
                      ? "🌴"
                      : index % 4 === 1
                      ? "🏔️"
                      : index % 4 === 2
                      ? "🏖️"
                      : "✈️"}
                  </span>

                  <span className="trip-number">
                    TRIP{" "}
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </span>
                </div>

                <div className="trip-card-content">
                  <div className="trip-card-heading">
                    <div>
                      <h3>{trip.title}</h3>

                      <p className="trip-destination">
                        📍 {trip.destination}
                      </p>
                    </div>

                    <span className="trip-status">
                      Planned
                    </span>
                  </div>

                  {(trip.startDate ||
                    trip.endDate) && (
                    <div className="trip-date-box">
                      <span>📅</span>

                      <div>
                        <small>
                          TRAVEL DATES
                        </small>

                        <strong>
                          {trip.startDate
                            ? new Date(
                                trip.startDate
                              ).toLocaleDateString(
                                undefined,
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric"
                                }
                              )
                            : "Not set"}

                          {" → "}

                          {trip.endDate
                            ? new Date(
                                trip.endDate
                              ).toLocaleDateString(
                                undefined,
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric"
                                }
                              )
                            : "Not set"}
                        </strong>
                      </div>
                    </div>
                  )}

                  {trip.notes && (
                    <p className="trip-notes">
                      {trip.notes}
                    </p>
                  )}

                  {attractionDays.length > 0 && (
                    <section
                      style={{
                        marginTop: "16px",
                        padding: "14px",
                        border: "1px solid #dce8ed",
                        borderRadius: "10px",
                        background: "#f8fcfc"
                      }}
                    >
                      <h4 style={{ margin: "0 0 10px", color: "#17324D" }}>
                        📍 Selected Places
                      </h4>
                      {attractionDays.map((day) => (
                        <div key={`${trip._id}-attractions-${day.day}`} style={{ marginBottom: "8px" }}>
                          <strong style={{ display: "block", fontSize: "12px", color: "#526273", marginBottom: "5px" }}>
                            DAY {day.day}{day.date ? ` · ${formatTripDate(day.date)}` : ""}
                          </strong>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {day.places.map((place, placeIndex) => (
                              <span key={`${place}-${placeIndex}`} style={{ padding: "5px 8px", borderRadius: "6px", background: "#fff", border: "1px solid #dce8ed", color: "#17324D", fontSize: "12px" }}>
                                {place}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </section>
                  )}

                  {lunchRestaurants.length > 0 && (
                    <section
                      style={{
                        marginTop: "14px",
                        padding: "14px",
                        border: "1px solid #cce9e2",
                        borderRadius: "10px",
                        background: "#f2fbf8"
                      }}
                    >
                      <h4 style={{ margin: "0 0 10px", color: "#087f70" }}>
                        🍽️ Selected Lunch Restaurants
                      </h4>
                      {lunchRestaurants.map((lunch) => {
                        const restaurant = lunch.restaurant;
                        const mapsUrl =
                          restaurant.mapsUrl ||
                          (restaurant.lat != null && restaurant.lon != null
                            ? `https://www.google.com/maps/search/?api=1&query=${restaurant.lat},${restaurant.lon}`
                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name || "restaurant")}`);

                        return (
                          <div key={`${trip._id}-lunch-${lunch.key}`} style={{ padding: "10px 0", borderTop: "1px solid #d8eee8" }}>
                            <strong style={{ display: "block", color: "#17324D" }}>
                              Day {lunch.day} · {restaurant.name || "Selected restaurant"}
                            </strong>
                            {(lunch.startTime || lunch.endTime) && (
                              <span style={{ display: "block", marginTop: "4px", color: "#526273", fontSize: "12px" }}>
                                {lunch.startTime || ""}{lunch.endTime ? ` – ${lunch.endTime}` : ""}
                              </span>
                            )}
                            {restaurant.address && (
                              <p style={{ margin: "5px 0", color: "#526273", fontSize: "13px" }}>
                                {restaurant.address}
                              </p>
                            )}
                            {restaurant.cuisine && (
                              <p style={{ margin: "4px 0", color: "#526273", fontSize: "12px" }}>
                                Cuisine: {restaurant.cuisine}
                              </p>
                            )}
                            {restaurant.distance != null && (
                              <p style={{ margin: "4px 0", color: "#526273", fontSize: "12px" }}>
                                {Number(restaurant.distance).toFixed(2)} km from lunch location
                              </p>
                            )}
                            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: "5px", color: "#087f70", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>
                              View restaurant on Google Maps →
                            </a>
                          </div>
                        );
                      })}
                    </section>
                  )}

                  {selectedHotel && (
                    <section style={{ marginTop: "14px", padding: "14px", border: "1px solid #dce8ed", borderRadius: "10px", background: "#fff" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
                        <h4 style={{ margin: 0, color: "#17324D" }}>🏨 Selected Hotel</h4>
                        <span style={{ color: "#805b00", fontSize: "11px", fontWeight: 700 }}>SELECTED · NOT BOOKED</span>
                      </div>
                      <strong style={{ display: "block", marginTop: "8px", color: "#17324D" }}>
                        {selectedHotel.name || "Selected hotel"}
                      </strong>
                      {selectedHotel.address && <p style={{ margin: "4px 0", color: "#526273", fontSize: "13px" }}>{selectedHotel.address}</p>}
                      {hotelPrice != null && (
                        <p style={{ margin: "5px 0 0", color: "#334155", fontSize: "13px", fontWeight: 600 }}>
                          Estimated price: {selectedHotel.price?.currency || "INR"} {Number(hotelPrice).toLocaleString()} / night
                        </p>
                      )}
                    </section>
                  )}

                  <div className="trip-card-footer">
                    <span>
                      Start planning →
                    </span>

                    <Link
                      to={`/trips/${trip._id}`}
                      className="open-trip-button"
                    >
                      Open Trip
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Create trip */}

      <section
        className="create-trip-section"
        id="create-trip"
      >
        <div className="create-trip-intro">
          <span className="create-trip-icon">
            ✈️
          </span>

          <span className="trips-label">
            START A NEW JOURNEY
          </span>

          <h2>
            Where are you going next?
          </h2>

          <p>
            Create a trip now. You can add your
            itinerary, places, budget and more
            later.
          </p>
        </div>

        <form
          className="create-trip-form"
          onSubmit={handleCreateTrip}
        >
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">
                Trip Title
              </label>

              <input
                id="title"
                type="text"
                placeholder="e.g. Goa Beach Escape"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="destination">
                Destination
              </label>

              <input
                id="destination"
                type="text"
                placeholder="e.g. Goa, India"
                value={destination}
                onChange={(event) =>
                  setDestination(
                    event.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">
                Start Date
              </label>

              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(event) =>
                  setStartDate(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">
                End Date
              </label>

              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(event) =>
                  setEndDate(
                    event.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">
              Trip Notes
            </label>

            <textarea
              id="notes"
              placeholder="What do you want to remember about this trip?"
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              rows="4"
            />
          </div>

          {createError && (
            <div className="create-trip-error">
              ⚠️ {createError}
            </div>
          )}

          <div className="create-trip-footer">
            <p>
              You can edit your itinerary after
              creating the trip.
            </p>

            <button
              type="submit"
              className="create-trip-button"
              disabled={creating}
            >
              {creating
                ? "Creating..."
                : "Create Trip →"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default MyTrips;