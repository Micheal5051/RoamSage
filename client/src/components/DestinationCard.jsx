import { Link } from "react-router-dom";
import "./DestinationCard.css";

function DestinationCard({ destination }) {
  const firstTag = destination.tags?.[0];

  return (
    <article className="destination-card">
      {/* Image */}

      <div className="destination-image-wrapper">
        {destination.image ? (
          <img
            className="destination-image"
            src={destination.image}
            alt={destination.name}
          />
        ) : (
          <div className="image-placeholder">
            🌍
          </div>
        )}

        {firstTag && (
          <span className="destination-category">
            {firstTag}
          </span>
        )}
      </div>

      {/* Content */}

      <div className="destination-content">
        <div className="destination-title-row">
          <div>
            <h3>{destination.name}</h3>

            <p className="destination-country">
              📍 {destination.country}
            </p>
          </div>

          <span className="destination-arrow">
            ↗
          </span>
        </div>

        <p className="destination-description">
          {destination.description ||
            "Discover this amazing destination and create unforgettable memories."}
        </p>

        {destination.tags &&
          destination.tags.length > 0 && (
            <div className="tags">
              {destination.tags
                .slice(0, 3)
                .map((tag) => (
                  <span key={tag}>
                    #{tag}
                  </span>
                ))}
            </div>
          )}

        <Link
          to={`/destinations/${destination._id}`}
          className="details-button"
        >
          <span>Explore destination</span>

          <span>→</span>
        </Link>
      </div>
    </article>
  );
}

export default DestinationCard;