import { useGetDriversQuery } from "@/lib/api";
import StatusBadge from "@/components/standalone/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Drivers() {
  const { data: drivers = [], isLoading, isError } = useGetDriversQuery();

  const totalDrivers = drivers.length;
  const availableDrivers = drivers.filter(
    (d) => d.availability === "AVAILABLE"
  ).length;
  const onTripDrivers = drivers.filter(
    (d) => d.availability === "ON_TRIP"
  ).length;
  const offDutyDrivers = drivers.filter(
    (d) => d.availability === "OFF_DUTY"
  ).length;

  const getAvailabilityBadge = (availability) => {
    switch (availability) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800";
      case "ON_TRIP":
        return "bg-blue-100 text-blue-800";
      case "OFF_DUTY":
        return "bg-gray-100 text-gray-800";
      case "SICK":
        return "bg-yellow-100 text-yellow-800";
      case "LEAVE":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading)
    return (
      <div className="container mx-auto px-4 py-6">Loading drivers...</div>
    );
  if (isError)
    return (
      <div className="container mx-auto px-4 py-6 text-red-600">
        Error loading drivers.
      </div>
    );

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
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {totalDrivers}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">Available</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {availableDrivers}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">On Trip</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {onTripDrivers}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">Off Duty</p>
            <p className="text-2xl font-bold text-gray-600 mt-1">
              {offDutyDrivers}
            </p>
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
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr
                    key={driver.driver_id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-black">
                      {driver.driver_id}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {driver.full_name || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {driver.license_number || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getAvailabilityBadge(
                          driver.availability
                        )}`}
                      >
                        {driver.availability}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-black">—</td>{" "}
                    <td className="py-3 px-4 text-sm">
                      <StatusBadge status={driver.status} />
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
