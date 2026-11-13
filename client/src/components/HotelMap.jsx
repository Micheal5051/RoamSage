import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./HotelMap.css";

const normalMarkerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const selectedMarkerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationMarkerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [28, 46],
  iconAnchor: [14, 46],
  popupAnchor: [1, -38],
  shadowSize: [41, 41]
});

function getHotelCoordinates(hotel) {
  const latitude = Number(
    hotel?.location?.latitude ?? hotel?.latitude
  );

  const longitude = Number(
    hotel?.location?.longitude ??
    hotel?.longitude ??
    hotel?.lng
  );

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return [latitude, longitude];
}

function MapController({ selectedHotel }) {
  const map = useMap();

  useEffect(() => {
    const position = getHotelCoordinates(selectedHotel);

    if (position) {
      map.flyTo(position, 15, {
        duration: 1
      });
    }
  }, [map, selectedHotel]);

  return null;
}

function formatHotelPrice(price) {
  if (
    price?.amount == null ||
    !Number.isFinite(Number(price.amount))
  ) {
    return "Price not available";
  }

  return `₹${Number(price.amount).toLocaleString("en-IN")} / ${
    price.period || "per night"
  }`;
}

function HotelMap({
  hotels = [],
  latitude,
  longitude,
  selectedHotel,
  radiusKm = 5,
  destinationName = "Selected Attraction"
}) {
  const destinationPosition = [
    Number(latitude),
    Number(longitude)
  ];

  const safeRadiusKm = Number(radiusKm);

  const radiusMeters =
    Number.isFinite(safeRadiusKm) && safeRadiusKm > 0
      ? safeRadiusKm * 1000
      : 5000;

  if (
    !Number.isFinite(destinationPosition[0]) ||
    !Number.isFinite(destinationPosition[1]) ||
    destinationPosition[0] < -90 ||
    destinationPosition[0] > 90 ||
    destinationPosition[1] < -180 ||
    destinationPosition[1] > 180
  ) {
    return (
      <div className="hotel-map-error">
        Destination coordinates are unavailable.
      </div>
    );
  }

  const validHotels = hotels
    .map((hotel) => ({
      hotel,
      position: getHotelCoordinates(hotel)
    }))
    .filter((item) => item.position);

  const selectedHotelId =
    selectedHotel?.id ?? selectedHotel?._id;

  return (
    <div className="hotel-map-wrapper">
      <MapContainer
        center={destinationPosition}
        zoom={13}
        scrollWheelZoom={true}
        className="hotel-leaflet-map"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Green marker for the selected attraction */}
        <Marker
          position={destinationPosition}
          icon={destinationMarkerIcon}
        >
          <Popup>
            <div className="hotel-map-destination-popup">
              <strong>{destinationName}</strong>
              <p>Your selected attraction</p>
              <span>Hotel search starting point</span>
            </div>
          </Popup>
        </Marker>

        {/* Radius circle follows the distance filter */}
        <Circle
          center={destinationPosition}
          radius={radiusMeters}
          pathOptions={{
            color: "#244c3e",
            weight: 2,
            fillColor: "#244c3e",
            fillOpacity: 0.08
          }}
        />

        <MapController selectedHotel={selectedHotel} />

        {/* Hotel markers */}
        {validHotels.map(({ hotel, position }) => {
          const hotelId = hotel.id ?? hotel._id;

          const isSelected =
            selectedHotelId != null &&
            String(selectedHotelId) === String(hotelId);

          return (
            <Marker
              key={
                hotelId ??
                `${hotel.name}-${position.join(",")}`
              }
              position={position}
              icon={
                isSelected
                  ? selectedMarkerIcon
                  : normalMarkerIcon
              }
              zIndexOffset={isSelected ? 1000 : 0}
            >
              <Popup>
                <div className="hotel-map-hotel-popup">
                  <strong>{hotel.name}</strong>

                  <p>
                    ⭐{" "}
                    {hotel.rating != null
                      ? hotel.rating
                      : "Rating not available"}
                  </p>

                  <p>
                    📍{" "}
                    {hotel.distance != null
                      ? `${hotel.distance} km away`
                      : "Distance not available"}
                  </p>

                  <p>{formatHotelPrice(hotel.price)}</p>

                  <p>
                    {hotel.availabilityStatus === "not_checked"
                      ? "● Availability not checked"
                      : hotel.available
                        ? "● Available"
                        : "● Unavailable"}
                  </p>

                  {isSelected && (
                    <span className="hotel-map-selected-label">
                      Selected hotel
                    </span>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default HotelMap;