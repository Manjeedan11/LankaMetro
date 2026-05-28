import { Play, CheckCircle, AlertCircle } from "lucide-react";
import StatusBadge from "@/components/standalone/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const mockTrips = {
  forward: {
    id: "T001",
    route: "R001 - Colombo to Kandy",
    vehicle: "V001 (WP-CD-1234)",
    departure: "08:00 AM",
    arrival: "11:00 AM",
    status: "SCHEDULED",
    passengers: "42/45",
  },
  return: {
    id: "T002",
    route: "R001 - Kandy to Colombo",
    vehicle: "V001 (WP-CD-1234)",
    departure: "01:00 PM",
    arrival: "04:00 PM",
    status: "SCHEDULED",
    passengers: "TBD",
  },
};

const notifications = [
  "Your trip scheduled for today at 8:00 AM",
  "Weather alert: Heavy rain expected on route",
  "Vehicle maintenance reminder: Next due in 5 days",
];

export default function DriverTrips() {
  const buttonBase =
    "border border-gray-300 text-black hover:bg-red-700 hover:text-white transition-colors";

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
      <div className="page-header">
        <h1 className="page-title">My Trips</h1>
        <p className="page-description">View your scheduled and active trips</p>
      </div>

      <div className="space-y-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Forward Trip</CardTitle>
            <StatusBadge status={mockTrips.forward.status} />
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Trip ID</span>
                <span className="text-sm font-medium text-black">
                  {mockTrips.forward.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Route</span>
                <span className="text-sm font-medium text-black">
                  {mockTrips.forward.route}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Vehicle</span>
                <span className="text-sm font-medium text-black">
                  {mockTrips.forward.vehicle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Departure</span>
                <span className="text-sm font-medium text-black">
                  {mockTrips.forward.departure}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Estimated Arrival</span>
                <span className="text-sm font-medium text-black">
                  {mockTrips.forward.arrival}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Passengers</span>
                <span className="text-sm font-medium text-black">
                  {mockTrips.forward.passengers}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button className={`flex-1 bg-primary ${buttonBase}`}>
                <Play size={16} className="mr-2" />
                Start Trip
              </Button>
              <Button variant="outline" className={buttonBase}>
                View Route
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Return Trip</CardTitle>
            <StatusBadge status={mockTrips.return.status} />
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Trip ID</span>
                <span className="text-sm font-medium text-black">
                  {mockTrips.return.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Route</span>
                <span className="text-sm font-medium text-black">
                  {mockTrips.return.route}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Vehicle</span>
                <span className="text-sm font-medium text-black">
                  {mockTrips.return.vehicle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Departure</span>
                <span className="text-sm font-medium text-black">
                  {mockTrips.return.departure}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Estimated Arrival</span>
                <span className="text-sm font-medium text-black">
                  {mockTrips.return.arrival}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Passengers</span>
                <span className="text-sm font-medium text-black">
                  {mockTrips.return.passengers}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                disabled
                className={`flex-1 bg-primary ${buttonBase} opacity-50 cursor-not-allowed`}
              >
                <Play size={16} className="mr-2" />
                Start Trip
              </Button>
              <Button variant="outline" className={buttonBase}>
                View Route
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-blue-200 shadow-sm border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="text-blue-600" size={20} />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications.map((notification, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-blue-50 rounded text-sm text-blue-900"
                >
                  • {notification}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
