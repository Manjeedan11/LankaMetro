import StatusBadge from "@/components/standalone/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const mockFleet = [
  {
    id: "V001",
    vehicle: "WP-CD-1234",
    capacity: 45,
    status: "AVAILABLE",
    route: "R001",
    availability: "100%",
  },
  {
    id: "V002",
    vehicle: "WP-CD-1235",
    capacity: 50,
    status: "AVAILABLE",
    route: "R002",
    availability: "100%",
  },
  {
    id: "V003",
    vehicle: "WP-CD-1236",
    capacity: 45,
    status: "AVAILABLE",
    route: "R003",
    availability: "95%",
  },
  {
    id: "V004",
    vehicle: "WP-CD-1237",
    capacity: 40,
    status: "UNAVAILABLE",
    route: "-",
    availability: "0%",
  },
  {
    id: "V005",
    vehicle: "WP-CD-1238",
    capacity: 48,
    status: "AVAILABLE",
    route: "R001",
    availability: "100%",
  },
];

export default function Fleet() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      <div className="page-header">
        <h1 className="page-title">Fleet Management</h1>
        <p className="page-description">View and manage fleet vehicles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">Total Vehicles</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">5</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">Available</p>
            <p className="text-2xl font-bold text-green-600 mt-1">4</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">Avg Capacity</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">45</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">Utilization</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">80%</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Fleet Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Vehicle ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Vehicle
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Capacity
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Assigned Route
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Availability
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockFleet.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-black">
                      {vehicle.id}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {vehicle.vehicle}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {vehicle.capacity} seats
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <StatusBadge status={vehicle.status} />
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {vehicle.route}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: vehicle.availability }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold text-gray-700">
                          {vehicle.availability}
                        </span>
                      </div>
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
