import { Route, BusFront, Users, MapPin } from "lucide-react";
import StatCard from "@/components/standalone/StatCard";
import StatusBadge from "@/components/standalone/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LogisticsDashboard() {
  const schedules = [
    {
      id: "S001",
      route: "R001 - Colombo to Kandy",
      driver: "John Doe",
      vehicle: "V001",
      departure: "08:00 AM",
      status: "IN_PROGRESS",
    },
    {
      id: "S002",
      route: "R002 - Kandy to Galle",
      driver: "Jane Smith",
      vehicle: "V002",
      departure: "09:30 AM",
      status: "SCHEDULED",
    },
    {
      id: "S003",
      route: "R003 - Galle Loop",
      driver: "Mike Brown",
      vehicle: "V003",
      departure: "02:00 PM",
      status: "SCHEDULED",
    },
  ];

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
          value="12"
          icon={Route}
          color="primary"
        />
        <StatCard
          title="Available Vehicles"
          value="34"
          icon={BusFront}
          color="blue"
        />
        <StatCard
          title="Available Drivers"
          value="28"
          icon={Users}
          color="green"
        />
        <StatCard
          title="Today's Trips"
          value="45"
          icon={MapPin}
          color="purple"
        />
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Route Map Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 h-80 rounded-lg flex items-center justify-center text-gray-500">
            Interactive route map would be displayed here
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Schedule Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Route
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Driver
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Vehicle
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Departure
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <tr
                    key={schedule.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm text-black">
                      {schedule.route}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {schedule.driver}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {schedule.vehicle}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {schedule.departure}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <StatusBadge status={schedule.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
