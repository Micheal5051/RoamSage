import {
  useEffect,
  useState
} from "react";

import {
  Link,
  useSearchParams
} from "react-router-dom";

import HotelMap from "../components/HotelMap";

import "./Hotels.css";

function Hotels() {
  const [hotels, setHotels] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedHotel, setSelectedHotel] = useState(null);

  const [searchParams] = useSearchParams();

  const latitude = Number(
    searchParams.get("latitude")
  );

  const longitude = Number(
    searchParams.get("longitude")
  );

  const destinationId =
    searchParams.get("destinationId");

  useEffect(() => {
    if (
      !searchParams.has("latitude") ||
      !searchParams.has("longitude") ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      setError("Destination location is missing.");
      setLoading(false);
      return;
    }

    async function fetchHotels() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/hotels?latitude=${latitude}&longitude=${longitude}&radius=5`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch hotels");
        }

        const data = await response.json();

        setHotels(data);
      } catch (fetchError) {
        console.error("Fetch hotels error:", fetchError);

        setError("Unable to load hotels.");
      } finally {
        setLoading(false);
      }
    }

    fetchHotels();
  }, [latitude, longitude, searchParams]);

  if (loading) {
    return (
      <div className="hotels-page">
        <p>Finding nearby hotels...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hotels-page">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <main className="hotels-page">

      {/* HEADER */}

      <div className="hotels-header">

        <p className="eyebrow">
          NEARBY STAYS
        </p>

        <h1>
          Hotels Near Your Destination
        </h1>

        <p>
          Showing hotels within 5 km of
          your selected destination.
        </p>

        <p className="hotel-data-notice">
          Hotel prices are illustrative estimates.
          Room availability has not been checked.
          Bookings in this project are demonstrations,
          not confirmed hotel reservations.
        </p>

      </div>


      {/* BACK TO DESTINATION */}

      {destinationId && (

        <Link
          to={`/destinations/${destinationId}`}
          className="hotel-destination-back"
        >
          ← Back to Destination
        </Link>

      )}


      {/* MAP AND HOTEL RESULTS */}

      {hotels.length > 0 ? (

        <div className="hotels-content">

          {/* LEFT: MAP */}

          <section className="hotel-map-section">

            <div className="hotel-map-header">

              <div>

                <h2>
                  Explore on Map
                </h2>

                <p>
                  Select a hotel to highlight
                  its location.
                </p>

              </div>

            </div>

            <div className="hotel-map-container">

              <HotelMap
                hotels={hotels}
                latitude={latitude}
                longitude={longitude}
                selectedHotel={selectedHotel}
              />

            </div>

          </section>


          {/* RIGHT: HOTEL CARDS */}

          <section className="hotel-results">

            <div className="hotel-results-header">

              <h2>
                Nearby Hotels
              </h2>

              <span>
                {hotels.length} found
              </span>

            </div>


            <div className="hotel-list">

              {hotels.map((hotel) => (

                <article
                  className={`hotel-card ${
                    selectedHotel?.id === hotel.id
                      ? "selected"
                      : ""
                  }`}
                  key={hotel.id}
                  onClick={() => setSelectedHotel(hotel)}
                >

                  <div className="hotel-card-content">

                    {/* HOTEL HEADER */}

                    <div className="hotel-card-header">

                      <h2>
                        {hotel.name}
                      </h2>

                      <span className="hotel-rating">
                        {hotel.rating != null
                          ? `⭐ ${hotel.rating}`
                          : "Rating not available"}
                      </span>

                    </div>


                    {/* ADDRESS */}

                    <p className="hotel-distance">
                      📍 {hotel.address || hotel.destination}
                    </p>


                    {/* DISTANCE */}

                    <p className="hotel-distance">
                      {Number.isFinite(Number(hotel.distance))
                        ? `${Number(hotel.distance).toFixed(2)} km away`
                        : "Distance not available"}
                    </p>


                    {/* REVIEWS */}

                    <p className="hotel-reviews">
                      {hotel.reviewCount != null
                        ? `${Number(hotel.reviewCount).toLocaleString()} reviews`
                        : "Reviews not available"}
                    </p>


                    {/* PRICE */}

                    <div className="hotel-price">

                      <strong>
                        ₹
                        {Number(
                          hotel.price?.amount || 0
                        ).toLocaleString("en-IN")}
                      </strong>

                      <span>
                        / {hotel.price?.period || "per night"}
                      </span>

                    </div>

                    <p className="hotel-estimate-label">
                      Estimated price only — actual rates may differ.
                    </p>


                    {/* AMENITIES */}

                    <div className="hotel-amenities">

                      {Array.isArray(hotel.amenities) &&
                        hotel.amenities.map((amenity) => (

                          <span key={amenity}>
                            {amenity}
                          </span>

                        ))}

                    </div>


                    {/* FOOTER */}

                    <div className="hotel-card-footer">

                      <span className="availability-unknown">
                        ● Availability not checked
                      </span>

                      <Link
                        to={
                          `/hotels/${hotel.id}` +
                          `?latitude=${latitude}` +
                          `&longitude=${longitude}` +
                          `&destinationId=${destinationId || ""}`
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

              ))}

            </div>

          </section>

        </div>

      ) : (

        <div className="no-hotels">

          <p>
            No hotels found within 5 km.
          </p>

        </div>

      )}

    </main>
  );
}

export default Hotels;