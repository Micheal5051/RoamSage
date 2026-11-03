
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./MyBookings.css";

function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState("");

  useEffect(() => {
    async function fetchBookings() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/bookings",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load bookings."
          );
        }

        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch bookings error:", err);
        setError(err.message || "Unable to load your bookings.");
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [navigate]);

  async function handleCancelBooking(bookingId) {
    const shouldCancel = window.confirm(
      "Are you sure you want to cancel this demo booking?"
    );

    if (!shouldCancel) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setCancellingId(bookingId);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/bookings/${bookingId}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to cancel booking."
        );
      }

      const updatedBooking = data.booking;

      if (!updatedBooking) {
        throw new Error(
          "The server did not return the updated booking."
        );
      }

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking._id === bookingId
            ? updatedBooking
            : booking
        )
      );
    } catch (err) {
      console.error("Cancel booking error:", err);
      setError(err.message || "Unable to cancel this booking.");
    } finally {
      setCancellingId("");
    }
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "Not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatPrice(value) {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
      return "Not available";
    }

    return `₹${amount.toLocaleString("en-IN")}`;
  }

  if (loading) {
    return (
      <main className="my-bookings-page">
        <p>Loading your bookings...</p>
      </main>
    );
  }

  return (
    <main className="my-bookings-page">
      <header className="my-bookings-header">
        <p className="my-bookings-eyebrow">
          YOUR TRAVEL PLANS
        </p>

        <h1>My Bookings</h1>

        <p>
          View and manage your hotel booking records in one place.
        </p>
      </header>

      <div className="my-bookings-demo-notice">
        <strong>Demo bookings</strong>
        <p>
          These bookings are created within the Travel Explorer
          application using sample hotel data. Prices are estimates.
          No real hotel reservations or payments are made.
        </p>
      </div>

      {error && (
        <div className="my-bookings-error" role="alert">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <section className="my-bookings-empty">
          <div className="my-bookings-empty-icon">🏨</div>

          <h2>No bookings yet</h2>

          <p>
            Your demo hotel booking records will appear here
            after you create a booking.
          </p>

          <Link
            to="/"
            className="my-bookings-primary-button"
          >
            Explore Destinations
          </Link>
        </section>
      ) : (
        <>
          <div className="my-bookings-count">
            {bookings.length} booking
            {bookings.length !== 1 ? "s" : ""}
          </div>

          <div className="my-bookings-list">
            {bookings.map((booking) => (
              <article
                className="my-booking-card"
                key={booking._id}
              >
                <div className="my-booking-card-header">
                  <div>
                    <p className="my-booking-label">
                      DEMO HOTEL BOOKING
                    </p>

                    <h2>{booking.hotelName}</h2>
                  </div>

                  <span
                    className={`my-booking-status ${
                      booking.status === "confirmed"
                        ? "status-confirmed"
                        : "status-cancelled"
                    }`}
                  >
                    {booking.status || "Unknown"}
                  </span>
                </div>

                <div className="my-booking-details">
                  <div>
                    <span>Guest</span>
                    <strong>{booking.guestName || "Not available"}</strong>
                  </div>

                  <div>
                    <span>Check-in</span>
                    <strong>{formatDate(booking.checkIn)}</strong>
                  </div>

                  <div>
                    <span>Check-out</span>
                    <strong>{formatDate(booking.checkOut)}</strong>
                  </div>

                  <div>
                    <span>Guests</span>
                    <strong>{booking.guests ?? "Not available"}</strong>
                  </div>
                </div>

                <div className="my-booking-card-footer">
                  <div>
                    <span className="my-booking-total-label">
                      Estimated total
                    </span>

                    <strong className="my-booking-total">
                      {formatPrice(booking.totalPrice)}
                    </strong>
                  </div>

                  <div className="my-booking-actions">
                    <Link
                      to={`/bookings/${booking._id}`}
                      className="my-booking-view-button"
                    >
                      View Details
                    </Link>

                    {booking.status === "confirmed" && (
                      <button
                        type="button"
                        className="my-booking-cancel-button"
                        disabled={cancellingId === booking._id}
                        onClick={() =>
                          handleCancelBooking(booking._id)
                        }
                      >
                        {cancellingId === booking._id
                          ? "Cancelling..."
                          : "Cancel Booking"}
                      </button>
                    )}
                  </div>
                </div>

                <p className="my-booking-reference">
                  Demo reference: {booking._id}
                </p>
              </article>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

export default MyBookings;
