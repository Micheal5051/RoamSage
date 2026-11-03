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
          `http://localhost:5000/api/hotels/${id}`
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
        <p>Loading hotel...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="hotel-details-page">
        <p>{error}</p>

        <Link
          to={hotelsUrl}
          className="hotel-back-button"
        >
          ← Back to Hotels
        </Link>
      </main>
    );
  }

  if (!hotel) {
    return (
      <main className="hotel-details-page">
        <p>Hotel information is unavailable.</p>

        <Link
          to={hotelsUrl}
          className="hotel-back-button"
        >
          ← Back to Hotels
        </Link>
      </main>
    );
  }

  const bookingUrl =
    `/hotels/${hotel.id}/book` +
    `?latitude=${latitude || ""}` +
    `&longitude=${longitude || ""}` +
    `&destinationId=${destinationId || ""}`;

  const formattedPrice = Number(
    hotel.price?.amount || 0
  ).toLocaleString("en-IN");

  return (
    <main className="hotel-details-page">

      {/* NAVIGATION */}

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


      {/* HOTEL DETAILS */}

      <section className="hotel-details-card">

        {/* HEADER */}

        <div className="hotel-details-header">

          <div>

            <span className="hotel-details-eyebrow">
              HOTEL DETAILS
            </span>

            <h1>
              {hotel.name}
            </h1>

            <p className="hotel-details-location">
              📍 {hotel.address || hotel.destination}
            </p>

            <p className="hotel-details-location">
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


        {/* MAIN CONTENT */}

        <div className="hotel-details-grid">

          <div className="hotel-details-main">

            <h2>
              About this hotel
            </h2>

            <p>
              {hotel.description ||
                `Enjoy your stay at ${hotel.name}. This property is located in ${hotel.destination || "your selected destination"}.`}
            </p>


            {/* AMENITIES */}

            <h2>
              Amenities
            </h2>

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


            {/* REVIEWS */}

            <h2>
              Guest Reviews
            </h2>

            {hotel.rating != null &&
            hotel.reviewCount != null ? (
              <p>
                ⭐ {hotel.rating} based on{" "}
                {Number(hotel.reviewCount).toLocaleString("en-IN")}{" "}
                reviews
              </p>
            ) : (
              <p>
                Guest ratings and review information
                are not currently available.
              </p>
            )}

          </div>


          {/* PRICE AND BOOKING */}

          <aside className="hotel-details-sidebar">

            <div className="hotel-price-card">

              <span>
                ESTIMATED PRICE
              </span>

              <strong>
                ₹{formattedPrice}
              </strong>

              <p>
                {hotel.price?.period || "per night"}
              </p>

              <p className="hotel-price-estimate-notice">
                This is an illustrative estimate.
                Actual hotel rates may differ.
              </p>


              {/* AVAILABILITY */}

              <span className="hotel-availability-unknown">
                ● Room availability not checked
              </span>


              {/* DEMO BOOKING */}

              {hotel.bookingEnabled !== false ? (

                <Link
                  to={bookingUrl}
                  className="hotel-book-button"
                >
                  Continue to Demo Booking
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
                This booking flow is a project
                demonstration. It does not confirm
                a reservation with the hotel.
              </p>

            </div>

          </aside>

        </div>

      </section>

    </main>
  );
}

export default HotelDetails;