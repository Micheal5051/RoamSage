import { apiUrl } from "../config/api";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./MyBookings.css";

function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState("");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalStep, setModalStep] = useState("confirm");

  useEffect(() => {
    async function fetchBookings() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          apiUrl("/api/bookings"),
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
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
        setError(
          err.message || "Unable to load your bookings."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [navigate]);

  function openCancelModal(booking) {
    setSelectedBooking(booking);
    setModalStep("confirm");
    setError("");
  }

  function closeCancelModal() {
    if (modalStep === "cancelling") return;

    setSelectedBooking(null);
    setModalStep("confirm");
  }

  async function handleCancelBooking() {
    if (!selectedBooking) return;

    const bookingId = selectedBooking._id;
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setCancellingId(bookingId);
      setModalStep("cancelling");
      setError("");

      const response = await fetch(
        apiUrl(`/api/bookings/${bookingId}/cancel`),
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`
          }
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

      setSelectedBooking(updatedBooking);
      setModalStep("success");
    } catch (err) {
      console.error("Cancel booking error:", err);

      setError(
        err.message || "Unable to cancel this booking."
      );

      setModalStep("error");
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
      year: "numeric"
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
        <div className="my-bookings-loading">
          <div className="booking-loading-spinner"></div>
          <p>Loading your bookings...</p>
        </div>
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

      {error && !selectedBooking && (
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
                    <strong>
                      {booking.guestName || "Not available"}
                    </strong>
                  </div>

                  <div>
                    <span>Check-in</span>
                    <strong>
                      {formatDate(booking.checkIn)}
                    </strong>
                  </div>

                  <div>
                    <span>Check-out</span>
                    <strong>
                      {formatDate(booking.checkOut)}
                    </strong>
                  </div>

                  <div>
                    <span>Guests</span>
                    <strong>
                      {booking.guests ?? "Not available"}
                    </strong>
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
                          openCancelModal(booking)
                        }
                      >
                        Cancel Booking
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

      {/* CANCELLATION MODAL */}
      {selectedBooking && (
        <div
          className="booking-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              modalStep !== "cancelling"
            ) {
              closeCancelModal();
            }
          }}
        >
          <section
            className="booking-cancel-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
          >
            <button
              type="button"
              className="booking-modal-close"
              onClick={closeCancelModal}
              disabled={modalStep === "cancelling"}
              aria-label="Close dialog"
            >
              ×
            </button>

            {modalStep === "confirm" && (
              <div className="booking-modal-content booking-modal-enter">
                <div className="booking-modal-icon warning-icon">
                  <span>!</span>
                </div>

                <p className="booking-modal-eyebrow">
                  BOOKING CANCELLATION
                </p>

                <h2 id="booking-modal-title">
                  Are you sure?
                </h2>

                <p className="booking-modal-description">
                  You're about to cancel your booking. Please
                  review the details before continuing.
                </p>

                <div className="booking-modal-summary">
                  <div>
                    <span>Hotel</span>
                    <strong>
                      {selectedBooking.hotelName}
                    </strong>
                  </div>

                  <div>
                    <span>Check-in</span>
                    <strong>
                      {formatDate(selectedBooking.checkIn)}
                    </strong>
                  </div>

                  <div>
                    <span>Estimated total</span>
                    <strong>
                      {formatPrice(selectedBooking.totalPrice)}
                    </strong>
                  </div>
                </div>

                <p className="booking-modal-note">
                  This will update the booking record in Travel
                  Explorer. Remember, this is a demo booking and
                  no real hotel reservation is being cancelled.
                </p>

                <div className="booking-modal-actions">
                  <button
                    type="button"
                    className="booking-keep-button"
                    onClick={closeCancelModal}
                  >
                    Keep Booking
                  </button>

                  <button
                    type="button"
                    className="booking-confirm-cancel-button"
                    onClick={handleCancelBooking}
                  >
                    Yes, Cancel Booking
                  </button>
                </div>
              </div>
            )}

            {modalStep === "cancelling" && (
              <div className="booking-modal-content booking-modal-enter">
                <div className="booking-cancelling-animation">
                  <div className="booking-spinner-ring"></div>
                  <span>↻</span>
                </div>

                <h2 id="booking-modal-title">
                  Cancelling booking...
                </h2>

                <p className="booking-modal-description">
                  Please wait while we update your booking record.
                </p>

                <div className="booking-progress-track">
                  <div className="booking-progress-bar"></div>
                </div>
              </div>
            )}

            {modalStep === "success" && (
              <div className="booking-modal-content booking-modal-enter">
                <div className="booking-success-animation">
                  <svg
                    viewBox="0 0 52 52"
                    aria-hidden="true"
                  >
                    <circle
                      className="booking-success-circle"
                      cx="26"
                      cy="26"
                      r="24"
                      fill="none"
                    />
                    <path
                      className="booking-success-check"
                      fill="none"
                      d="M14 27 L22 35 L39 17"
                    />
                  </svg>
                </div>

                <p className="booking-modal-eyebrow">
                  SUCCESSFULLY UPDATED
                </p>

                <h2 id="booking-modal-title">
                  Booking cancelled
                </h2>

                <p className="booking-modal-description">
                  Your demo booking at{" "}
                  <strong>{selectedBooking.hotelName}</strong>{" "}
                  has been successfully cancelled.
                </p>

                <div className="booking-success-status">
                  <span>Booking status</span>
                  <strong>Cancelled</strong>
                </div>

                <button
                  type="button"
                  className="booking-success-button"
                  onClick={closeCancelModal}
                >
                  Done
                </button>
              </div>
            )}

            {modalStep === "error" && (
              <div className="booking-modal-content booking-modal-enter">
                <div className="booking-modal-icon error-icon">
                  <span>!</span>
                </div>

                <p className="booking-modal-eyebrow">
                  SOMETHING WENT WRONG
                </p>

                <h2 id="booking-modal-title">
                  Cancellation failed
                </h2>

                <p className="booking-modal-description">
                  {error ||
                    "We couldn't cancel this booking. Please try again."}
                </p>

                <div className="booking-modal-actions">
                  <button
                    type="button"
                    className="booking-keep-button"
                    onClick={closeCancelModal}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    className="booking-confirm-cancel-button"
                    onClick={handleCancelBooking}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

export default MyBookings;