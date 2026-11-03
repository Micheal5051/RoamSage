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


/* =========================
   NORMAL HOTEL MARKER
   ========================= */

const normalMarkerIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],

  iconAnchor: [12, 41],

  popupAnchor: [1, -34],

  shadowSize: [41, 41]
});


/* =========================
   SELECTED HOTEL MARKER
   RED
   ========================= */

const selectedMarkerIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],

  iconAnchor: [12, 41],

  popupAnchor: [1, -34],

  shadowSize: [41, 41]
});


/* =========================
   MAP CONTROLLER
   ========================= */

function MapController({
  selectedHotel
}) {
  const map = useMap();

  if (selectedHotel) {

    const position = [
      selectedHotel.location.latitude,
      selectedHotel.location.longitude
    ];

    map.flyTo(
      position,
      15,
      {
        duration: 1
      }
    );
  }

  return null;
}


/* =========================
   HOTEL MAP
   ========================= */

function HotelMap({
  hotels,
  latitude,
  longitude,
  selectedHotel
}) {

  const destinationPosition = [
    latitude,
    longitude
  ];


  return (

    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "500px"
      }}
    >

      <MapContainer
        center={destinationPosition}
        zoom={13}
        scrollWheelZoom={true}
        style={{
          width: "100%",
          height: "100%"
        }}
      >


        {/* =========================
            MAP TILES
            ========================= */}

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        {/* =========================
            DESTINATION MARKER
            ========================= */}

        <Marker
          position={destinationPosition}
          icon={normalMarkerIcon}
        >

          <Popup>

            <strong>
              Selected Destination
            </strong>

            <br />

            Latitude: {latitude}

            <br />

            Longitude: {longitude}

          </Popup>

        </Marker>


        {/* =========================
            5 KM SEARCH AREA
            ========================= */}

        <Circle
          center={destinationPosition}
          radius={5000}
          pathOptions={{
            fillOpacity: 0.08
          }}
        />


        {/* =========================
            MAP CONTROLLER
            ========================= */}

        <MapController
          selectedHotel={selectedHotel}
        />


        {/* =========================
            HOTEL MARKERS
            ========================= */}

        {hotels.map((hotel) => {

          const isSelected =
            selectedHotel?.id === hotel.id;


          return (

            <Marker
              key={hotel.id}
              position={[
                hotel.location.latitude,
                hotel.location.longitude
              ]}
              icon={
                isSelected
                  ? selectedMarkerIcon
                  : normalMarkerIcon
              }
            >

              <Popup>

                <strong>
                  {hotel.name}
                </strong>

                <br />

                ⭐ {hotel.rating}

                <br />

                📍 {hotel.distance} km away

                <br />

                ₹
                {hotel.price.amount.toLocaleString()}
                {" / "}
                {hotel.price.period}

                <br />
                <br />

                {hotel.available
                  ? "● Available"
                  : "● Unavailable"}

              </Popup>

            </Marker>

          );

        })}


      </MapContainer>

    </div>
  );
}

export default HotelMap;