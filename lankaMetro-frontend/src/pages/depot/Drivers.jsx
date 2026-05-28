import { Edit2, Trash2 } from "lucide-react";
import StatusBadge from "@/components/standalone/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const mockDrivers = [
  {
    id: "DR001",
    name: "John Doe",
    license: "DL-2024-001",
    availability: "AVAILABLE",
    route: "R001",
    status: "ACTIVE",
  },
  {
    id: "DR002",
    name: "Jane Smith",
    license: "DL-2024-002",
    availability: "AVAILABLE",
    route: "R002",
    status: "ACTIVE",
  },
  {
    id: "DR003",
    name: "Mike Brown",
    license: "DL-2024-003",
    availability: "ON_TRIP",
    route: "R003",
    status: "ACTIVE",
  },
  {
    id: "DR004",
    name: "Sarah Davis",
    license: "DL-2024-004",
    availability: "OFF_DUTY",
    route: "-",
    status: "ACTIVE",
  },
  {
    id: "DR005",
    name: "Robert Wilson",
    license: "DL-2024-005",
    availability: "AVAILABLE",
    route: "R001",
    status: "ACTIVE",
  },
];

export default function Drivers() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      <div className="page-header">
        <h1 className="page-title">Driver Management</h1>
        <p className="page-description">Manage and monitor all drivers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">Total Drivers</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">5</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">Available</p>
            <p className="text-2xl font-bold text-green-600 mt-1">3</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">On Trip</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">1</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">Off Duty</p>
            <p className="text-2xl font-bold text-gray-600 mt-1">1</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>All Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Driver ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Driver Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    License Number
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Availability
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Assigned Route
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockDrivers.map((driver) => (
                  <tr
                    key={driver.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-black">
                      {driver.id}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {driver.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {driver.license}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {driver.availability}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {driver.route}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <StatusBadge status={driver.status} />
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex gap-2">
                        <button className="p-1.5 hover:bg-gray-200 rounded text-primary">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-1.5 hover:bg-gray-200 rounded text-red-600">
                          <Trash2 size={16} />
                        </button>
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
