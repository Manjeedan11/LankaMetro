import { BusFront, Users, AlertTriangle, TrendingUp } from "lucide-react";
import StatCard from "@/components/standalone/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DepotSupervisorDashboard() {
  const fleetStatus = [
    { vehicle: "V001", status: "ACTIVE", route: "R001", trips: 5 },
    { vehicle: "V002", status: "ACTIVE", route: "R002", trips: 4 },
    { vehicle: "V003", status: "MAINTENANCE", route: "-", trips: 0 },
  ];

  const driverStatus = [
    { name: "John Doe", available: true, route: "R001" },
    { name: "Jane Smith", available: true, route: "R002" },
    { name: "Mike Brown", available: false, route: "-" },
  ];

  const activeTrips = [
    {
      id: "T001",
      route: "R001",
      driver: "John Doe",
      status: "In Progress",
      completion: "45%",
    },
    {
      id: "T002",
      route: "R002",
      driver: "Jane Smith",
      status: "In Progress",
      completion: "60%",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-8">
      <div className="page-header">
        <h1 className="page-title">Depot Supervisor Dashboard</h1>
        <p className="page-description">Monitor fleet and operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Vehicles"
          value="45"
          icon={BusFront}
          color="primary"
        />
        <StatCard title="Total Drivers" value="28" icon={Users} color="blue" />
        <StatCard
          title="Active Trips"
          value="12"
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Alerts"
          value="3"
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
              {fleetStatus.map((vehicle) => (
                <div
                  key={vehicle.vehicle}
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
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle>Driver Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {driverStatus.map((driver) => (
                <div
                  key={driver.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div>
                    <p className="font-medium text-sm text-black">
                      {driver.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {driver.route || "Off Duty"}
                    </p>
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Active Trips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeTrips.map((trip) => (
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
        </CardContent>
      </Card>

      <Card className="border border-yellow-200 bg-yellow-50 border-l-4 border-l-yellow-500 shadow-sm">
        <CardHeader>
          <CardTitle className="text-yellow-900">Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="text-sm text-yellow-900">
              • Vehicle V002 maintenance due in 2 days
            </li>
            <li className="text-sm text-yellow-900">
              • Driver Mike Brown off duty tomorrow
            </li>
            <li className="text-sm text-yellow-900">
              • Route R001 experiencing high traffic
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
