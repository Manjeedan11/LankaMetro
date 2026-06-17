import { useState } from "react";
import {
  useGetDriversQuery,
  useGetSchedulesQuery,
  useRequestSuddenTripForDriverMutation,
} from "@/lib/api";
import { Toaster, toast } from "sonner"; // 👈 added Toaster import
import StatusBadge from "@/components/standalone/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/standalone/ConfirmDialog";

export default function Drivers() {
  const today = new Date().toISOString().split("T")[0];
  const {
    data: drivers = [],
    isLoading,
    isError,
    refetch,
  } = useGetDriversQuery();
  const { data: schedules = [] } = useGetSchedulesQuery(today);
  const [requestSuddenTripForDriver] = useRequestSuddenTripForDriverMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [selectedDriverName, setSelectedDriverName] = useState("");

  const driverRouteMap = new Map();
  schedules.forEach((schedule) => {
    if (
      schedule.driver_id &&
      schedule.route_name &&
      !driverRouteMap.has(schedule.driver_id)
    ) {
      driverRouteMap.set(schedule.driver_id, schedule.route_name);
    }
  });

  const totalDrivers = drivers.length;
  const availableDrivers = drivers.filter(
    (d) => d.availability === "AVAILABLE"
  ).length;
  const onTripDrivers = drivers.filter(
    (d) => d.availability === "ON_TRIP" || d.availability === "ON_DUTY"
  ).length;
  const offDutyDrivers = drivers.filter(
    (d) => d.availability === "OFF_DUTY"
  ).length;

  const getAvailabilityBadge = (availability) => {
    switch (availability) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800";
      case "ON_TRIP":
      case "ON_DUTY":
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

  const handleRequestTrip = async () => {
    try {
      await requestSuddenTripForDriver(selectedDriverId).unwrap();
      toast.success(
        `Sudden trip request sent for driver ${selectedDriverName}. Logistics officer notified.`,
        {
          icon: "🚨",
          style: { background: "#dcfce7", color: "#166534" },
        }
      );
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to request sudden trip", {
        icon: "❌",
        style: { background: "#fee2e2", color: "#b91c1c" },
      });
    } finally {
      setDialogOpen(false);
      setSelectedDriverId(null);
      setSelectedDriverName("");
    }
  };

  const openDialog = (driverId, fullName) => {
    setSelectedDriverId(driverId);
    setSelectedDriverName(fullName);
    setDialogOpen(true);
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
      {/* 👇 Toaster added */}
      <Toaster position="bottom-right" richColors={false} />

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
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => {
                  const assignedRoute =
                    driverRouteMap.get(driver.driver_id) || "—";
                  return (
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
                      <td className="py-3 px-4 text-sm text-black">
                        {assignedRoute}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {driver.availability === "AVAILABLE" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              openDialog(driver.driver_id, driver.full_name)
                            }
                            className="border border-gray-300 text-black hover:bg-red-700 hover:text-white rounded-md"
                          >
                            Request Trip
                          </Button>
                        )}
                        {driver.availability === "PENDING" && (
                          <span className="text-xs text-yellow-600 font-medium bg-yellow-50 px-2 py-1 rounded">
                            Pending assignment
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleRequestTrip}
        title="Request Sudden Trip for Driver"
        description={`This will notify the logistics officer to assign a trip for driver ${selectedDriverName}. Do you want to proceed?`}
        confirmText="Yes, Request"
        cancelText="Cancel"
      />
    </div>
  );
}
