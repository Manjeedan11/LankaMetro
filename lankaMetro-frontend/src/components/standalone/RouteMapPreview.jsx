import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import { useGetRouteStopsQuery } from "@/lib/api";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function RouteMapPreview({ routeId }) {
  const {
    data: stops = [],
    isLoading,
    isError,
  } = useGetRouteStopsQuery(routeId);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    if (stops && stops.length) {
      const coords = stops
        .filter((stop) => stop.latitude && stop.longitude)
        .map((stop) => [stop.latitude, stop.longitude]);
      setPositions(coords);
    }
  }, [stops]);

  console.log("Stops from API:", stops);

  if (isLoading)
    return (
      <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
        Loading map...
      </div>
    );
  if (isError)
    return (
      <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-red-500">
        Failed to load route stops
      </div>
    );
  if (!stops.length)
    return (
      <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
        No stops defined for this route.
      </div>
    );
  if (positions.length < 2)
    return (
      <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
        Insufficient coordinates to draw route (need at least 2 stops with
        lat/lon).
      </div>
    );

  const center = positions[0];
  return (
    <MapContainer
      center={center}
      zoom={8}
      style={{ height: "400px", width: "100%", borderRadius: "0.5rem" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {stops.map((stop) => {
        if (!stop.latitude || !stop.longitude) return null;
        return (
          <Marker key={stop.stop_id} position={[stop.latitude, stop.longitude]}>
            <Popup>
              <strong>{stop.stop_name}</strong>
              {stop.location && <br />}
              {stop.location}
            </Popup>
          </Marker>
        );
      })}
      {positions.length > 1 && (
        <Polyline positions={positions} color="blue" weight={4} opacity={0.8} />
      )}
    </MapContainer>
  );
}
