import { BusFront, Users, AlertTriangle, TrendingUp } from "lucide-react";
import StatCard from "@/components/standalone/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGetVehiclesQuery,
  useGetDriversQuery,
  useGetSchedulesQuery,
  useGetMaintenanceRecordsQuery,
} from "@/lib/api";

export default function DepotSupervisorDashboard() {
  const today = new Date().toISOString().split("T")[0];

  const { data: vehicles = [] } = useGetVehiclesQuery();
  const { data: drivers = [] } = useGetDriversQuery();
  const { data: schedules = [] } = useGetSchedulesQuery(today);
  const { data: maintenanceRecords = [] } = useGetMaintenanceRecordsQuery();

  const totalVehicles = vehicles.length;
  const totalDrivers = drivers.length;
  const activeTrips = schedules.filter(
    (s) => s.status === "IN_PROGRESS"
  ).length;
  const alerts = maintenanceRecords.filter(
    (m) => m.status === "PENDING"
  ).length;

  const fleetSummary = vehicles.slice(0, 3).map((v) => ({
    vehicle: v.plate_number,
    status: v.status,
    route: "N/A",
    trips: 0,
  }));

  const driverSummary = drivers.slice(0, 3).map((d) => ({
    name: d.full_name,
    available: d.availability === "AVAILABLE",
    route: "N/A",
  }));

  const activeTripsList = schedules
    .filter((s) => s.status === "IN_PROGRESS")
    .slice(0, 2)
    .map((s) => ({
      id: s.schedule_id,
      route: s.route_name || "Unknown",
      driver: s.driver_name || "Unknown",
      status: s.status,
      completion: "50%",
    }));

  const alertMessages = maintenanceRecords
    .filter((m) => m.status === "PENDING")
    .slice(0, 3)
    .map(
      (m) =>
        `• Vehicle ${m.plate_number || m.vehicle_id} ${m.type} due on ${
          m.service_date
        }`
    );

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-8">
      <div className="page-header">
        <h1 className="page-title">Depot Supervisor Dashboard</h1>
        <p className="page-description">Monitor fleet and operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Vehicles"
          value={totalVehicles}
          icon={BusFront}
          color="primary"
        />
        <StatCard
          title="Total Drivers"
          value={totalDrivers}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Trips"
          value={activeTrips}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Alerts"
          value={alerts}
          icon={AlertTriangle}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle>Fleet Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fleetSummary.length === 0 ? (
                <p className="text-sm text-gray-500">No vehicles found.</p>
              ) : (
                fleetSummary.map((vehicle, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-medium text-sm text-black">
                        {vehicle.vehicle}
                      </p>
                      <p className="text-xs text-gray-600">{vehicle.route}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          vehicle.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {vehicle.status}
                      </span>
                      <p className="text-xs text-gray-600 mt-1">
                        {vehicle.trips} trips
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle>Driver Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {driverSummary.length === 0 ? (
                <p className="text-sm text-gray-500">No drivers found.</p>
              ) : (
                driverSummary.map((driver, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-medium text-sm text-black">
                        {driver.name}
                      </p>
                      <p className="text-xs text-gray-600">{driver.route}</p>
                    </div>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        driver.available
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {driver.available ? "Available" : "Unavailable"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Active Trips</CardTitle>
        </CardHeader>
        <CardContent>
          {activeTripsList.length === 0 ? (
            <p className="text-sm text-gray-500">
              No active trips at the moment.
            </p>
          ) : (
            <div className="space-y-3">
              {activeTripsList.map((trip) => (
                <div
                  key={trip.id}
                  className="border-b border-gray-100 pb-3 last:border-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm text-black">
                        {trip.route} - {trip.driver}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Status: {trip.status}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-blue-600">
                      {trip.completion}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: trip.completion }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-yellow-200 bg-yellow-50 border-l-4 border-l-yellow-500 shadow-sm">
        <CardHeader>
          <CardTitle className="text-yellow-900">Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {alertMessages.length === 0 ? (
            <p className="text-sm text-yellow-900">No pending alerts.</p>
          ) : (
            <ul className="space-y-2">
              {alertMessages.map((msg, idx) => (
                <li key={idx} className="text-sm text-yellow-900">
                  {msg}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
