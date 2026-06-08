import { useState, useEffect } from "react";
import { Route, BusFront, Users, MapPin } from "lucide-react";
import StatCard from "@/components/standalone/StatCard";
import StatusBadge from "@/components/standalone/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGetRoutesQuery,
  useGetVehiclesQuery,
  useGetDriversQuery,
  useGetSchedulesQuery,
  useGetStopsQuery,
} from "@/lib/api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function LogisticsDashboard() {
  // Fetch data
  const { data: routes = [] } = useGetRoutesQuery();
  const { data: vehicles = [] } = useGetVehiclesQuery();
  const { data: drivers = [] } = useGetDriversQuery();
  const { data: stops = [] } = useGetStopsQuery();
  const today = new Date().toISOString().split("T")[0];
  const { data: schedules = [] } = useGetSchedulesQuery(today);

  const activeRoutes = routes.filter((r) => r.availability === "ACTIVE").length;
  const availableVehicles = vehicles.filter(
    (v) => v.status === "ACTIVE"
  ).length;
  const availableDrivers = drivers.filter(
    (d) => d.availability === "AVAILABLE"
  ).length;
  const todaysTrips = schedules.length;

  const stopsWithCoords = stops.filter((s) => s.latitude && s.longitude);
  const mapCenter =
    stopsWithCoords.length > 0
      ? [stopsWithCoords[0].latitude, stopsWithCoords[0].longitude]
      : [7.0, 80.5];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-8">
      <div className="page-header">
        <h1 className="page-title">Logistics Dashboard</h1>
        <p className="page-description">
          Monitor routes, schedules and operations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Routes"
          value={activeRoutes}
          icon={Route}
          color="primary"
        />
        <StatCard
          title="Available Vehicles"
          value={availableVehicles}
          icon={BusFront}
          color="blue"
        />
        <StatCard
          title="Available Drivers"
          value={availableDrivers}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Today's Trips"
          value={todaysTrips}
          icon={MapPin}
          color="purple"
        />
      </div>

      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="bg-white">
          <CardTitle className="text-lg font-semibold">
            Bus Stop Locations
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          {stopsWithCoords.length === 0 ? (
            <div className="bg-gray-100 h-80 rounded-lg flex items-center justify-center text-gray-500">
              No stop coordinates available to display on map.
            </div>
          ) : (
            <MapContainer
              center={mapCenter}
              zoom={8}
              style={{ height: "400px", width: "100%", borderRadius: "0.5rem" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {stopsWithCoords.map((stop) => (
                <Marker
                  key={stop.stop_id}
                  position={[stop.latitude, stop.longitude]}
                >
                  <Popup>
                    <strong>{stop.stop_name}</strong>
                    {stop.location && <br />}
                    {stop.location}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Showing {stopsWithCoords.length} of {stops.length} stops with
            coordinates.
          </p>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="bg-white">
          <CardTitle className="text-lg font-semibold">
            Today's Schedules
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-white p-0">
          <div className="overflow-x-auto bg-white">
            <table className="w-full bg-white">
              <thead className="bg-white">
                <tr className="border-b border-gray-200 bg-white">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-white">
                    Route
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-white">
                    Driver
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-white">
                    Vehicle
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-white">
                    Departure
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-white">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {schedules.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-6 text-gray-500 bg-white"
                    >
                      No schedules for today.
                    </td>
                  </tr>
                ) : (
                  schedules.map((schedule) => (
                    <tr
                      key={schedule.schedule_id}
                      className="border-b border-gray-100 hover:bg-gray-50 bg-white"
                    >
                      <td className="py-3 px-4 text-sm text-black bg-white">
                        {schedule.route_name || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-sm text-black bg-white">
                        {schedule.driver_name || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-sm text-black bg-white">
                        {schedule.plate_number || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-sm text-black bg-white">
                        {schedule.departure_time}
                      </td>
                      <td className="py-3 px-4 text-sm bg-white">
                        <StatusBadge status={schedule.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
