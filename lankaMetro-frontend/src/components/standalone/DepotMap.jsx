import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useGetDepotsQuery } from "@/lib/api";

// Create a custom red bus marker using divIcon
const createBusMarkerIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background-color: #dc2626;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 6v6"/>
          <path d="M15 6v6"/>
          <path d="M2 12h19.6M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4c-1.1 0-2 .8-2.3 1.9l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2L3.5 18H4"/>
          <path d="M7 18h2"/>
          <path d="M15 18h2"/>
        </svg>
      </div>
    `,
    className: "custom-bus-marker",
    iconSize: [32, 32],
    popupAnchor: [0, -16],
  });
};

// Fix default Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function DepotMap() {
  const { data: depots = [], isLoading, isError } = useGetDepotsQuery();

  const depotsWithCoords = depots.filter((d) => d.latitude && d.longitude);
  const center =
    depotsWithCoords.length > 0
      ? [depotsWithCoords[0].latitude, depotsWithCoords[0].longitude]
      : [7.0, 80.5];

  if (isLoading) {
    return (
      <div className="h-64 bg-gray-100 rounded animate-pulse flex items-center justify-center text-gray-500">
        Loading map...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-64 bg-red-50 rounded flex items-center justify-center text-red-600">
        Error loading depot locations.
      </div>
    );
  }

  if (depotsWithCoords.length === 0) {
    return (
      <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-500">
        No depot coordinates available. Please add latitude/longitude to depots.
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={7}
      style={{ height: "400px", width: "100%", borderRadius: "0.5rem" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {depotsWithCoords.map((depot) => (
        <Marker
          key={depot.depot_id}
          position={[depot.latitude, depot.longitude]}
          icon={createBusMarkerIcon()}
        >
          <Popup>
            <strong>{depot.depot_name}</strong>
            <br />
            {depot.location}
            <br />
            Contact: {depot.contact_number}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
