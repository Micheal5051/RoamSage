import { apiUrl } from "../config/api";
import {
  useEffect,
  useState
} from "react";

import {
  Link,
  useSearchParams,
  useParams
} from "react-router-dom";

import "./HotelDetails.css";

function HotelDetails() {
  const { id } = useParams();

  const [searchParams] = useSearchParams();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");
  const destinationId = searchParams.get("destinationId");

  useEffect(() => {
    async function fetchHotel() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          apiUrl(`/api/hotels/${id}`)
        );

        if (!response.ok) {
          throw new Error("Hotel not found");
        }

        const data = await response.json();

        setHotel(data);
      } catch (fetchError) {
        console.error(fetchError);
        setError("Unable to load this hotel.");
      } finally {
        setLoading(false);
      }
    }

    fetchHotel();
  }, [id]);

  const hotelsUrl =
    `/hotels?latitude=${latitude || ""}` +
    `&longitude=${longitude || ""}` +
    `&destinationId=${destinationId || ""}`;

  if (loading) {
    return (
      <main className="hotel-details-page">
        <div className="hotel-details-state">
          <div className="hotel-details-spinner"></div>
          <p>Loading hotel...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="hotel-details-page">
        <div className="hotel-details-state">
          <h2>Hotel not available</h2>
          <p>{error}</p>

          <Link
            to={hotelsUrl}
            className="hotel-back-button"
          >
            ← Back to Hotels
          </Link>
        </div>
      </main>
    );
  }

  if (!hotel) {
    return (
      <main className="hotel-details-page">
        <div className="hotel-details-state">
          <h2>Hotel information unavailable</h2>
          <p>We couldn't find the requested hotel.</p>

          <Link
            to={hotelsUrl}
            className="hotel-back-button"
          >
            ← Back to Hotels
          </Link>
        </div>
      </main>
    );
  }

  const bookingUrl =
    `/hotels/${hotel.id}/book` +
    `?latitude=${latitude || ""}` +
    `&longitude=${longitude || ""}` +
    `&destinationId=${destinationId || ""}`;

  const formattedPrice =
    hotel.price?.amount != null &&
    Number.isFinite(Number(hotel.price.amount))
      ? Number(hotel.price.amount).toLocaleString("en-IN")
      : null;

  return (
    <main className="hotel-details-page">

      {/* Navigation */}

      <div className="hotel-details-navigation">
        <Link
          to={hotelsUrl}
          className="hotel-back-button"
        >
          ← Back to Hotels
        </Link>

        {destinationId && (
          <Link
            to={`/destinations/${destinationId}`}
            className="hotel-destination-button"
          >
            ← Back to Destination
          </Link>
        )}
      </div>

      {/* Hotel Details */}

      <section className="hotel-details-card">

        {/* Header */}

        <div className="hotel-details-header">
          <div>
            <span className="hotel-details-eyebrow">
              HOTEL DETAILS
            </span>

            <h1>{hotel.name}</h1>

            <p className="hotel-details-location">
              📍 {hotel.address || hotel.destination}
            </p>

            <p className="hotel-details-location hotel-distance-info">
              {Number.isFinite(Number(hotel.distance))
                ? `${Number(hotel.distance).toFixed(2)} km from selected destination`
                : "Distance not available"}
            </p>
          </div>

          <div className="hotel-details-rating">
            {hotel.rating != null
              ? `⭐ ${hotel.rating}`
              : "Rating not available"}
          </div>
        </div>

        {/* Main Content */}

        <div className="hotel-details-grid">

          <div className="hotel-details-main">

            <section className="hotel-info-section">
              <span className="hotel-section-eyebrow">
                ABOUT THE PROPERTY
              </span>

              <h2>About this hotel</h2>

              <p>
                {hotel.description ||
                  `Enjoy your stay at ${hotel.name}. This property is located in ${hotel.destination || "your selected destination"}.`}
              </p>
            </section>

            {/* Amenities */}

            <section className="hotel-info-section">
              <span className="hotel-section-eyebrow">
                FACILITIES
              </span>

              <h2>Amenities</h2>

              <div className="hotel-details-amenities">
                {Array.isArray(hotel.amenities) &&
                  hotel.amenities.map((amenity) => (
                    <span key={amenity}>
                      {amenity}
                    </span>
                  ))}

                {(!hotel.amenities ||
                  hotel.amenities.length === 0) && (
                  <p>
                    Amenities information is not available.
                  </p>
                )}
              </div>
            </section>

            {/* Reviews */}

            <section className="hotel-info-section">
              <span className="hotel-section-eyebrow">
                GUEST EXPERIENCE
              </span>

              <h2>Guest Reviews</h2>

              {hotel.rating != null &&
              hotel.reviewCount != null ? (
                <div className="hotel-review-summary">
                  <span className="hotel-review-star">
                    ★
                  </span>

                  <p>
                    <strong>{hotel.rating}</strong> based on{" "}
                    {Number(
                      hotel.reviewCount
                    ).toLocaleString("en-IN")}{" "}
                    reviews
                  </p>
                </div>
              ) : (
                <p>
                  Guest ratings and review information
                  are not currently available.
                </p>
              )}
            </section>
          </div>

          {/* Price and Booking */}

          <aside className="hotel-details-sidebar">
            <div className="hotel-price-card">

              <span className="hotel-price-eyebrow">
                ESTIMATED PRICE
              </span>

              {formattedPrice !== null ? (
                <strong className="hotel-price-amount">
                  ₹{formattedPrice}
                </strong>
              ) : (
                <strong className="hotel-price-amount hotel-price-unavailable">
                  Price not available
                </strong>
              )}

              <p className="hotel-price-period">
                {hotel.price?.period || "per night"}
              </p>

              <div className="hotel-price-divider"></div>

              <p className="hotel-price-estimate-notice">
                This is an illustrative estimate.
                Actual hotel rates may differ.
              </p>

              {/* Availability */}

              <div className="hotel-availability-unknown">
                <span>●</span>
                Room availability not checked
              </div>

              {/* Demo Booking */}

              {hotel.bookingEnabled !== false ? (
                <Link
                  to={bookingUrl}
                  className="hotel-book-button"
                >
                  Continue to Demo Booking
                  <span>→</span>
                </Link>
              ) : (
                <button
                  type="button"
                  className="hotel-book-button"
                  disabled
                >
                  Booking Unavailable
                </button>
              )}

              <p className="hotel-demo-notice">
                This booking flow is a project demonstration.
                It does not confirm a reservation with the hotel.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default HotelDetails;