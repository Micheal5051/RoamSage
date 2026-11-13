
import { useState } from "react";
import { Link } from "react-router-dom";
import "./DestinationCard.css";

const destinationFallbackImages = {
  hyderabad:
    "https://images.unsplash.com/photo-1750834115164-8c2658f18dd0?auto=format&fit=crop&w=1200&q=85",

  goa:
    "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=85",
};

function DestinationCard({ destination }) {
  const [imageAttempt, setImageAttempt] = useState(0);

  const destinationName = destination.name || "Destination";
  const firstTag = destination.tags?.[0];

  const fallbackImage =
    destinationFallbackImages[destinationName.toLowerCase().trim()];

  const primaryImage = destination.image || fallbackImage;

  const currentImage =
    imageAttempt === 0
      ? primaryImage
      : imageAttempt === 1
        ? fallbackImage
        : null;

  const handleImageError = () => {
    if (imageAttempt === 0 && fallbackImage && primaryImage !== fallbackImage) {
      setImageAttempt(1);
    } else {
      setImageAttempt(2);
    }
  };

  return (
    <article className="destination-card">
      <Link
        to={`/destinations/${destination._id}`}
        className="destination-image-wrapper"
        aria-label={`Explore ${destinationName}`}
      >
        {currentImage ? (
          <img
            className="destination-image"
            src={currentImage}
            alt={`${destinationName}, India`}
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <div className="image-placeholder">
            <span className="placeholder-icon">✦</span>
            <span className="placeholder-name">
              {destinationName}
            </span>
            <span className="placeholder-caption">
              DESTINATION PHOTOGRAPH
            </span>
          </div>
        )}

        <span className="image-number">DESTINATION</span>

        {firstTag && (
          <span className="destination-category">
            {firstTag}
          </span>
        )}
      </Link>

      <div className="destination-content">
        <div className="destination-title-row">
          <div className="destination-heading-info">
            <h3>{destinationName}</h3>

            <p className="destination-country">
              <span>⌖</span>
              {destination.country}
            </p>
          </div>

          <Link
            to={`/destinations/${destination._id}`}
            className="destination-arrow"
            aria-label={`View ${destinationName}`}
          >
            ↗
          </Link>
        </div>

        <p className="destination-description">
          {destination.description ||
            "Discover this amazing destination and create unforgettable memories."}
        </p>

        {destination.tags?.length > 0 && (
          <div className="tags">
            {destination.tags.slice(0, 3).map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        )}

        {/* OPEN DESTINATION TRAVEL GUIDE */}
        <Link
          to={`/destinations/${destination._id}`}
          className="details-button"
        >
          <span>DISCOVER</span>
          <span className="details-arrow">↗</span>
        </Link>
      </div>
    </article>
  );
}

export default DestinationCard;
