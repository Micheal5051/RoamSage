import { apiUrl } from "../config/api";

import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams
} from "react-router-dom";

import "./Booking.css";

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");
  const destinationId = searchParams.get("destinationId");
  const initialTripId = searchParams.get("tripId") || "";

  const [hotel, setHotel] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(initialTripId);

  const [loading, setLoading] = useState(true);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [error, setError] = useState("");

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");
  const [submitting, setSubmitting] = useState(false);

  function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const today = getTodayDate();

  useEffect(() => {
    async function fetchHotel() {
      try {
        const response = await fetch(
          apiUrl(`/api/hotels/${id}`)
        );

        if (!response.ok) {
          throw new Error("Hotel not found");
        }

        const data = await response.json();
        setHotel(data);
      } catch (fetchError) {
        console.error("Fetch hotel error:", fetchError);
        setError("Unable to load hotel information.");
      } finally {
        setLoading(false);
      }
    }

    fetchHotel();
  }, [id]);

  useEffect(() => {
    async function fetchTrips() {
      const token = localStorage.getItem("token");

      if (!token) return;

      setTripsLoading(true);

      try {
        const response = await fetch(
          apiUrl("/api/trips"),
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load trips.");
        }

        setTrips(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        console.error("Fetch trips error:", fetchError);
      } finally {
        setTripsLoading(false);
      }
    }

    fetchTrips();
  }, []);

  function calculateNights() {
    if (!checkIn || !checkOut) return 0;

    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      checkIn < today ||
      checkOut <= checkIn
    ) {
      return 0;
    }

    return Math.round(
      (end.getTime() - start.getTime()) /
        (1000 * 60 * 60 * 24)
    );
  }

  const nights = calculateNights();

  const pricePerNight = Number(
    hotel?.price?.amount ?? hotel?.pricePerNight
  );

  const hasValidPrice =
    Number.isFinite(pricePerNight) && pricePerNight >= 0;

  const totalPrice =
    hotel && hasValidPrice
      ? nights * pricePerNight
      : 0;

  function validateForm() {
    if (!guestName.trim()) {
      return "Please enter the guest's full name.";
    }

    if (!guestEmail.trim()) {
      return "Please enter an email address.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(guestEmail.trim())) {
      return "Please enter a valid email address.";
    }

    if (!checkIn || !checkOut) {
      return "Please select both check-in and check-out dates.";
    }

    if (checkIn < today) {
      return "Check-in cannot be in the past.";
    }

    if (checkOut <= checkIn) {
      return "Check-out must be after check-in.";
    }

    const guestCount = Number(guests);

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      return "Please select a valid number of guests.";
    }

    if (!hotel || !hotel.available) {
      return "This hotel is currently unavailable.";
    }

    if (!hasValidPrice) {
      return "The hotel's price is unavailable. Please choose another hotel or try again later.";
    }

    if (
      selectedTripId &&
      !trips.some((trip) => trip._id === selectedTripId)
    ) {
      return "Please select a valid trip.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setSubmitting(true);

      const bookingDetails = {
        hotelId: hotel.id,
        hotelName: hotel.name,
        checkIn,
        checkOut,
        guests: Number(guests),
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        pricePerNight,
        totalPrice
      };

      if (selectedTripId) {
        bookingDetails.tripId = selectedTripId;
      }

      const response = await fetch(
        apiUrl("/api/bookings"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(bookingDetails)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Booking failed.");
      }

      navigate(`/bookings/${data._id}`);
    } catch (submitError) {
      console.error("Create booking error:", submitError);
      setError(
        submitError.message || "Unable to complete booking."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const hotelBackLink =
    `/hotels/${id}` +
    `?latitude=${latitude || ""}` +
    `&longitude=${longitude || ""}` +
    `&destinationId=${destinationId || ""}`;

  if (loading) {
    return (
      <main className="booking-page">
        <p>Loading booking information...</p>
      </main>
    );
  }

  if (error && !hotel) {
    return (
      <main className="booking-page">
        <p>{error}</p>

        <Link to={hotelBackLink} className="booking-back-button">
          ← Back to Hotel
        </Link>
      </main>
    );
  }

  if (!hotel) return null;

  return (
    <main className="booking-page">
      <Link to={hotelBackLink} className="booking-back-button">
        ← Back to Hotel
      </Link>

      <div className="booking-layout">
        <section className="booking-form-card">
          <span className="booking-eyebrow">
            RESERVE YOUR STAY
          </span>

          <h1>Book {hotel.name}</h1>

          <p className="booking-subtitle">
            Enter your details to confirm your stay.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="guestName">Guest Name</label>

              <input
                id="guestName"
                type="text"
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="guestEmail">Email</label>

              <input
                id="guestEmail"
                type="email"
                value={guestEmail}
                onChange={(event) => setGuestEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="checkIn">Check-in</label>

                <input
                  id="checkIn"
                  type="date"
                  value={checkIn}
                  min={today}
                  onChange={(event) => {
                    setCheckIn(event.target.value);
                    setError("");

                    if (
                      checkOut &&
                      event.target.value &&
                      checkOut <= event.target.value
                    ) {
                      setCheckOut("");
                    }
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="checkOut">Check-out</label>

                <input
                  id="checkOut"
                  type="date"
                  value={checkOut}
                  min={checkIn && checkIn >= today ? checkIn : today}
                  onChange={(event) => {
                    setCheckOut(event.target.value);
                    setError("");
                  }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="guests">Guests</label>

              <select
                id="guests"
                value={guests}
                onChange={(event) => setGuests(event.target.value)}
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="5">5 Guests</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="trip">Associate with a trip (optional)</label>

              <select
                id="trip"
                value={selectedTripId}
                onChange={(event) => setSelectedTripId(event.target.value)}
                disabled={tripsLoading}
              >
                <option value="">No trip selected</option>

                {trips.map((trip) => (
                  <option key={trip._id} value={trip._id}>
                    {trip.title} — {trip.destination}
                  </option>
                ))}
              </select>

              <small>
                Select a trip to connect this hotel booking to your travel plan.
              </small>
            </div>

            {error && (
              <p className="booking-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="confirm-booking-button"
              disabled={submitting || !hotel.available || !hasValidPrice}
            >
              {submitting
                ? "Confirming..."
                : !hotel.available
                  ? "Hotel Unavailable"
                  : "Confirm Booking"}
            </button>
          </form>
        </section>

        <aside className="booking-summary-card">
          <span>BOOKING SUMMARY</span>

          <h2>{hotel.name}</h2>

          <div className="summary-row">
            <span>Price per night</span>

            <strong>
              {hasValidPrice
                ? `₹${pricePerNight.toLocaleString("en-IN")}`
                : "Price unavailable"}
            </strong>
          </div>

          <div className="summary-row">
            <span>Nights</span>
            <strong>{nights}</strong>
          </div>

          <div className="summary-row">
            <span>Guests</span>
            <strong>{guests}</strong>
          </div>

          <div className="summary-total">
            <span>Total</span>

            <strong>
              {hasValidPrice
                ? `₹${totalPrice.toLocaleString("en-IN")}`
                : "—"}
            </strong>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Booking;
