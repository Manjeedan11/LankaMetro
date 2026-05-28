import StatusBadge from "@/components/standalone/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const mockHistory = [
  {
    id: "H001",
    route: "R001 - Colombo to Kandy",
    vehicle: "V001",
    date: "2024-05-26",
    status: "COMPLETED",
  },
  {
    id: "H002",
    route: "R001 - Kandy to Colombo",
    vehicle: "V001",
    date: "2024-05-26",
    status: "COMPLETED",
  },
  {
    id: "H003",
    route: "R002 - Kandy Loop",
    vehicle: "V002",
    date: "2024-05-25",
    status: "COMPLETED",
  },
  {
    id: "H004",
    route: "R001 - Colombo to Kandy",
    vehicle: "V001",
    date: "2024-05-25",
    status: "COMPLETED",
  },
  {
    id: "H005",
    route: "R003 - Galle Connector",
    vehicle: "V003",
    date: "2024-05-24",
    status: "COMPLETED",
  },
  {
    id: "H006",
    route: "R002 - Kandy Loop",
    vehicle: "V002",
    date: "2024-05-24",
    status: "COMPLETED",
  },
  {
    id: "H007",
    route: "R001 - Colombo to Kandy",
    vehicle: "V001",
    date: "2024-05-23",
    status: "COMPLETED",
  },
];

export default function DriverHistory() {
  const totalTrips = mockHistory.length;
  const completedTrips = mockHistory.filter(
    (h) => h.status === "COMPLETED"
  ).length;
  const completionRate = ((completedTrips / totalTrips) * 100).toFixed(0);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      <div className="page-header">
        <h1 className="page-title">Trip History</h1>
        <p className="page-description">
          View your completed trips and performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">Total Trips</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {totalTrips}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {completedTrips}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">Completion Rate</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {completionRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Completed Trips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Trip ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Route
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Vehicle
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockHistory.map((trip) => (
                  <tr
                    key={trip.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-black">
                      {trip.id}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {trip.route}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {trip.vehicle}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {trip.date}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <StatusBadge status={trip.status} />
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
