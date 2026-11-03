
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./TripDashboard.css";


function formatGeneratedDate(value) {
  if (!value) return "";

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function formatGeneratedTime(value) {
  if (!value) return "";

  const match = String(value).match(/^(\d{1,2}):(\d{2})$/);

  if (!match) return value;

  const date = new Date();

  date.setHours(Number(match[1]), Number(match[2]), 0, 0);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatGeneratedDuration(minutes) {
  const total = Number(minutes);

  if (!Number.isFinite(total) || total <= 0) return "";

  const hours = Math.floor(total / 60);
  const remainder = total % 60;

  if (hours && remainder) return `${hours} hr ${remainder} min`;
  if (hours) return `${hours} hr`;

  return `${remainder} min`;
}

function getRestaurantMapsUrl(restaurant = {}) {
  if (restaurant.mapsUrl) return restaurant.mapsUrl;

  if (restaurant.lat != null && restaurant.lon != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lon}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    restaurant.name || "restaurant"
  )}`;
}

function TripDashboard() {
  const { id } = useParams();

  const [trip, setTrip] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTrip();
  }, [id]);

  async function fetchTrip() {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in to view this trip.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/trips/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch trip"
        );
      }

      setTrip(data);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Selected hotel saved by the itinerary generator.
  // This is a selection, not a confirmed booking.

  const selectedHotel =
    trip?.generatedItinerary?.selectedHotel ||
    trip?.selectedHotel ||
    null;

  const selectedHotelPrice =
    selectedHotel?.price?.amount ??
    selectedHotel?.price?.value ??
    selectedHotel?.estimatedPrice ??
    selectedHotel?.pricePerNight ??
    null;

  const selectedHotelCurrency =
    selectedHotel?.price?.currency || "INR";

  const selectedHotelLatitude =
    selectedHotel?.location?.latitude ??
    selectedHotel?.latitude;

  const selectedHotelLongitude =
    selectedHotel?.location?.longitude ??
    selectedHotel?.longitude;

  const selectedHotelMapUrl =
    selectedHotel?.mapsUrl ||
    selectedHotel?.googleMapsUrl ||
    (selectedHotelLatitude != null &&
    selectedHotelLongitude != null
      ? `https://www.google.com/maps/search/?api=1&query=${selectedHotelLatitude},${selectedHotelLongitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${selectedHotel?.name || "hotel"} ${trip?.destination || ""}`
        )}`);

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {
    return (
      <main className="trip-page-state">
        <div className="trip-spinner"></div>

        <p>Loading your trip...</p>
      </main>
    );
  }

  // ==========================================
  // ERROR STATE
  // ==========================================

  if (error) {
    return (
      <main className="trip-page-state">
        <span className="trip-error-icon">
          🧳
        </span>

        <h2>Unable to load this trip</h2>

        <p>{error}</p>

        <Link
          to="/trips"
          className="trip-state-button"
        >
          ← Back to My Trips
        </Link>
      </main>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <main className="trip-dashboard-page">
      <Link
        to="/trips"
        className="dashboard-back-link"
      >
        ← Back to My Trips
      </Link>

      {/* TRIP OVERVIEW */}

      <section className="trip-dashboard-hero">
        <div className="trip-hero-top">
          <span className="trip-dashboard-label">
            YOUR JOURNEY
          </span>

          <span className="trip-planned-badge">
            ● Planned
          </span>
        </div>

        <h1>{trip.title}</h1>

        <div className="trip-hero-meta">
          <span>
            📍 {trip.destination}
          </span>

          {trip.startDate && (
            <span>
              📅{" "}
              {new Date(
                trip.startDate
              ).toLocaleDateString(
                undefined,
                {
                  day: "numeric",
                  month: "short"
                }
              )}
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
                : "—"}
            </span>
          )}
        </div>

        {trip.notes && (
          <p className="trip-hero-notes">
            “{trip.notes}”
          </p>
        )}
      </section>

      {/* SELECTED HOTEL */}

      {selectedHotel && (
        <section
          className="selected-hotel-dashboard-card"
          style={{
            background: "#ffffff",
            border: "1px solid #dbe4ec",
            borderRadius: "16px",
            padding: "22px",
            margin: "24px 0",
            boxShadow: "0 8px 24px rgba(23, 50, 77, 0.06)"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap"
            }}
          >
            <div>
              <span className="dashboard-label">
                YOUR STAY
              </span>

              <h2
                style={{
                  color: "#17324D",
                  margin: "6px 0 0"
                }}
              >
                Selected Hotel
              </h2>
            </div>

            <span
              style={{
                background: "#fff4d6",
                color: "#805b00",
                borderRadius: "20px",
                padding: "7px 12px",
                fontSize: "12px",
                fontWeight: 700
              }}
            >
              SELECTED · NOT BOOKED
            </span>
          </div>

          <h3
            style={{
              color: "#17324D",
              margin: "18px 0 6px",
              fontSize: "21px"
            }}
          >
            {selectedHotel.name || "Selected hotel"}
          </h3>

          {selectedHotel.address && (
            <p
              style={{
                color: "#526273",
                margin: "0 0 12px",
                lineHeight: 1.5
              }}
            >
              {selectedHotel.address}
            </p>
          )}

          <div
            style={{
              display: "flex",
              gap: "18px",
              flexWrap: "wrap",
              color: "#334155",
              fontSize: "14px"
            }}
          >
            {selectedHotelPrice != null && (
              <span>
                <strong>Estimated price:</strong>{" "}
                {selectedHotelCurrency}{" "}
                {Number(selectedHotelPrice).toLocaleString()} / night
              </span>
            )}

            {selectedHotel.nearestAttraction && (
              <span>
                <strong>Nearby attraction:</strong>{" "}
                {selectedHotel.nearestAttraction}
              </span>
            )}

            {selectedHotel.nearestDistance != null && (
              <span>
                <strong>Distance:</strong>{" "}
                {selectedHotel.nearestDistance} km
              </span>
            )}
          </div>

          <a
            href={selectedHotelMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              marginTop: "16px",
              color: "#1769aa",
              fontWeight: 700,
              textDecoration: "none"
            }}
          >
            View hotel on Google Maps →
          </a>

          <p
            style={{
              color: "#718096",
              fontSize: "12px",
              margin: "12px 0 0"
            }}
          >
            This hotel is saved as your selection. It is not a confirmed
            reservation or payment.
          </p>
        </section>
      )}

      {/* GENERATED DAY-BY-DAY ITINERARY */}

      {trip.generatedItinerary &&
        Array.isArray(trip.generatedItinerary.days) && (
          <section className="generated-itinerary-section">
            <div className="generated-itinerary-heading">
              <span className="dashboard-label">
                YOUR GENERATED PLAN
              </span>

              <h2>Day-by-day schedule</h2>

              <p>
                Your saved itinerary, including hotel-to-attraction and
                attraction-to-attraction driving estimates, planned visits,
                and breaks. Driving estimates do not include live traffic.
              </p>
            </div>

            {trip.generatedItinerary.days.map((day, index) => {
              const events =
                Array.isArray(day.schedule) && day.schedule.length
                  ? day.schedule
                  : day.attractions || [];

              return (
                <article
                  className="generated-day-card"
                  key={`${day.date || "day"}-${day.day || index + 1}`}
                >
                  <div className="generated-day-heading">
                    <div>
                      <span className="generated-day-kicker">
                        DAY {day.day || index + 1}
                      </span>

                      <h3>
                        {formatGeneratedDate(day.date) ||
                          `Day ${day.day || index + 1}`}
                      </h3>

                      {day.weekday && (
                        <p>{day.weekday}</p>
                      )}
                    </div>

                    <span className="generated-event-count">
                      {events.length}{" "}
                      {events.length === 1 ? "event" : "events"}
                    </span>
                  </div>

                  {events.length ? (
                    <div className="generated-schedule">
                      {events.map((event, eventIndex) => {
                        const eventType = event.type || "attraction";
                        const isBreak = eventType === "break";
                        const isTravel = eventType === "travel";

                        const title =
                          event.name ||
                          event.title ||
                          (isBreak
                            ? "Break"
                            : isTravel
                              ? "Travel time"
                              : "Planned activity");

                        const start = formatGeneratedTime(
                          event.startTime
                        );

                        const end = formatGeneratedTime(
                          event.endTime
                        );

                        const duration = formatGeneratedDuration(
                          event.durationMinutes ||
                            event.estimatedVisitMinutes
                        );

                        return (
                          <div
                            className={`generated-event generated-event-${
                              isBreak
                                ? "break"
                                : isTravel
                                  ? "travel"
                                  : "attraction"
                            }`}
                            key={
                              event.id ||
                              event._id ||
                              `${title}-${eventIndex}`
                            }
                          >
                            <div className="generated-event-time">
                              {start || "Time not set"}

                              {end && <span>{end}</span>}
                            </div>

                            <div className="generated-event-marker">
                              <span>
                                {isBreak
                                  ? "☕"
                                  : isTravel
                                    ? "🚗"
                                    : "📍"}
                              </span>
                            </div>

                            <div className="generated-event-content">
                              <div className="generated-event-title-row">
                                <h4>{title}</h4>

                                {duration && (
                                  <span className="generated-duration">
                                    {duration}
                                  </span>
                                )}
                              </div>

                              {event.category && (
                                <span className="generated-category">
                                  {event.category}
                                </span>
                              )}

                              {event.notes && <p>{event.notes}</p>}

                              {event.description && (
                                <p>{event.description}</p>
                              )}

                              {/* TRAVEL BEFORE THIS ATTRACTION */}

                              {eventType === "attraction" &&
                                event.travelBefore && (
                                  <div
                                    className="generated-travel-leg"
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
                                      {event.travelBefore.fromName} →{" "}
                                      {event.travelBefore.toName}
                                    </strong>

                                    {event.travelBefore.available ? (
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
                                            {formatGeneratedDuration(
                                              event.travelBefore.durationMinutes
                                            )}
                                          </strong>

                                          {event.travelBefore.distanceKm != null &&
                                            ` · ${event.travelBefore.distanceKm} km`}
                                        </p>

                                        {event.travelBefore.departureTime &&
                                          event.travelBefore.arrivalTime && (
                                            <p
                                              style={{
                                                margin: "4px 0",
                                                color: "#52616b",
                                                fontSize: "12px"
                                              }}
                                            >
                                              Leave at{" "}
                                              {event.travelBefore.departureTime}
                                              {" · "}Estimated arrival{" "}
                                              {event.travelBefore.arrivalTime}
                                            </p>
                                          )}

                                        {event.travelBefore.scheduleConflictMinutes > 0 && (
                                          <p
                                            style={{
                                              margin: "6px 0",
                                              color: "#b42318",
                                              fontSize: "12px",
                                              fontWeight: 700
                                            }}
                                          >
                                            This route may delay the planned
                                            visit by about{" "}
                                            {formatGeneratedDuration(
                                              event.travelBefore.scheduleConflictMinutes
                                            )}. The day's schedule may need
                                            adjustment.
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
                                        {event.travelBefore.message ||
                                          "Driving time is currently unavailable."}
                                      </p>
                                    )}

                                    {event.travelBefore.navigationUrl && (
                                      <a
                                        href={event.travelBefore.navigationUrl}
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

                              {/* SELECTED LUNCH RESTAURANT */}

                              {isBreak && event.selectedRestaurant && (
                                <div
                                  className="generated-selected-restaurant"
                                  style={{
                                    marginTop: "12px",
                                    padding: "13px",
                                    border: "1px solid #cce9e2",
                                    borderRadius: "9px",
                                    background: "#f2fbf8"
                                  }}
                                >
                                  <span
                                    style={{
                                      display: "block",
                                      marginBottom: "6px",
                                      color: "#087f70",
                                      fontSize: "11px",
                                      fontWeight: 800,
                                      letterSpacing: "0.7px",
                                      textTransform: "uppercase"
                                    }}
                                  >
                                    Selected lunch restaurant
                                  </span>

                                  <strong
                                    style={{
                                      display: "block",
                                      color: "#17324d"
                                    }}
                                  >
                                    {event.selectedRestaurant.name ||
                                      "Selected restaurant"}
                                  </strong>

                                  {event.selectedRestaurant.address && (
                                    <p
                                      style={{
                                        margin: "5px 0",
                                        color: "#526273",
                                        fontSize: "13px"
                                      }}
                                    >
                                      {event.selectedRestaurant.address}
                                    </p>
                                  )}

                                  {event.selectedRestaurant.cuisine && (
                                    <p
                                      style={{
                                        margin: "4px 0",
                                        color: "#526273",
                                        fontSize: "12px"
                                      }}
                                    >
                                      Cuisine:{" "}
                                      {event.selectedRestaurant.cuisine}
                                    </p>
                                  )}

                                  <a
                                    href={getRestaurantMapsUrl(
                                      event.selectedRestaurant
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: "inline-block",
                                      marginTop: "6px",
                                      color: "#087f70",
                                      fontSize: "13px",
                                      fontWeight: 700,
                                      textDecoration: "none"
                                    }}
                                  >
                                    View restaurant on Google Maps →
                                  </a>
                                </div>
                              )}

                              {eventType === "attraction" &&
                                event.openingHoursVerified === false && (
                                  <span className="generated-hours-note">
                                    Opening hours have not been verified.
                                  </span>
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="generated-empty-day">
                      No scheduled events for this day.
                    </p>
                  )}
                </article>
              );
            })}

            {Array.isArray(
              trip.generatedItinerary.unplannedAttractions
            ) &&
              trip.generatedItinerary.unplannedAttractions.length > 0 && (
                <section className="unplanned-attractions">
                  <div>
                    <span className="dashboard-label">
                      OPTIONAL IDEAS
                    </span>

                    <h3>
                      Places that didn't fit into the schedule
                    </h3>

                    <p>
                      These attractions were not placed into a time slot.
                      You can consider them if you have extra time.
                    </p>
                  </div>

                  <div className="unplanned-attraction-list">
                    {trip.generatedItinerary.unplannedAttractions.map(
                      (place, index) => (
                        <article
                          className="unplanned-attraction-card"
                          key={
                            place.id ||
                            place._id ||
                            `${place.name || "place"}-${index}`
                          }
                        >
                          <span>＋</span>

                          <div>
                            <h4>
                              {place.name ||
                                place.title ||
                                "Suggested place"}
                            </h4>

                            {place.category && (
                              <p>{place.category}</p>
                            )}

                            {place.reason && (
                              <p>{place.reason}</p>
                            )}
                          </div>
                        </article>
                      )
                    )}
                  </div>
                </section>
              )}
          </section>
        )}

      {/* TRIP TOOLS */}

      <section className="dashboard-features">
        <div className="dashboard-section-heading">
          <div>
            <span className="dashboard-label">
              TRIP TOOLS
            </span>

            <h2>Make your trip smarter</h2>

            <p>
              Everything you need to organize your journey.
            </p>
          </div>
        </div>

        <div className="feature-grid">
          {/* BUDGET */}

          <article className="feature-card budget-feature">
            <div className="feature-icon">
              💰
            </div>

            <div>
              <span>TRACK</span>
              <h3>Budget</h3>

              <p>
                Keep track of your estimated and actual travel expenses.
              </p>
            </div>

            <span className="feature-status">
              Coming soon
            </span>
          </article>

          {/* MAP */}

          <article className="feature-card map-feature">
            <div className="feature-icon">
              🗺️
            </div>

            <div>
              <span>EXPLORE</span>
              <h3>Trip Map</h3>

              <p>
                See your destinations and planned places on a map.
              </p>
            </div>

            <span className="feature-status">
              Coming soon
            </span>
          </article>

          {/* AI */}

          <article className="feature-card ai-feature">
            <div className="feature-icon">
              🤖
            </div>

            <div>
              <span>ASSIST</span>
              <h3>AI Assistant</h3>

              <p>
                Get personalized recommendations for your journey.
              </p>
            </div>

            <span className="feature-status">
              Coming soon
            </span>
          </article>
        </div>
      </section>
    </main>
  );
}

export default TripDashboard;
