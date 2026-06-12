import { useState } from "react";
import {
  useGetVehiclesQuery,
  useGetSchedulesQuery,
  useRequestSuddenTripMutation,
} from "@/lib/api";
import StatusBadge from "@/components/standalone/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/standalone/ConfirmDialog";
import { toast } from "sonner";

export default function Fleet() {
  const today = new Date().toISOString().split("T")[0];

  const {
    data: vehicles = [],
    isLoading: vehiclesLoading,
    isError: vehiclesError,
    refetch: refetchVehicles,
  } = useGetVehiclesQuery();

  const {
    data: schedules = [],
    isLoading: schedulesLoading,
    error: schedulesError,
  } = useGetSchedulesQuery(today, {
    skip: !today,
  });

  const [requestSuddenTrip] = useRequestSuddenTripMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState("");

  const vehicleRouteMap = new Map();
  if (Array.isArray(schedules)) {
    schedules.forEach((schedule) => {
      if (
        schedule.vehicle_id &&
        schedule.route_name &&
        !vehicleRouteMap.has(schedule.vehicle_id)
      ) {
        vehicleRouteMap.set(schedule.vehicle_id, schedule.route_name);
      }
    });
  }

  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(
    (v) => v.status === "ACTIVE"
  ).length;
  const avgCapacity = totalVehicles
    ? (
        vehicles.reduce((sum, v) => sum + v.capacity, 0) / totalVehicles
      ).toFixed(0)
    : 0;

  const vehiclesWithSchedules = new Set(schedules.map((s) => s.vehicle_id))
    .size;
  const utilization = totalVehicles
    ? ((vehiclesWithSchedules / totalVehicles) * 100).toFixed(0)
    : 0;

  const handleRequestTrip = async () => {
    try {
      await requestSuddenTrip(selectedVehicleId).unwrap();
      toast.success(
        `Sudden trip request sent for vehicle ${selectedVehiclePlate}. Logistics officer notified.`,
        {
          icon: "🚨",
          style: { background: "#dcfce7", color: "#166534" },
        }
      );
      refetchVehicles();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to request sudden trip", {
        icon: "❌",
        style: { background: "#fee2e2", color: "#b91c1c" },
      });
    } finally {
      setDialogOpen(false);
      setSelectedVehicleId(null);
      setSelectedVehiclePlate("");
    }
  };

  const openDialog = (vehicleId, plateNumber) => {
    setSelectedVehicleId(vehicleId);
    setSelectedVehiclePlate(plateNumber);
    setDialogOpen(true);
  };

  if (vehiclesLoading || schedulesLoading) {
    return (
      <div className="container mx-auto px-4 py-6">Loading fleet data...</div>
    );
  }

  if (vehiclesError) {
    return (
      <div className="container mx-auto px-4 py-6 text-red-600">
        Error loading fleet data. Please try again later.
      </div>
    );
  }

  if (schedulesError) {
    console.error("Schedules fetch error:", schedulesError);
  }

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
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {totalVehicles}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">Available</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {availableVehicles}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">Avg Capacity</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {avgCapacity}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">
              Today's Utilization
            </p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {utilization}%
            </p>
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
                    Plate Number
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
                    Today's Trips
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => {
                  const todaysTrips = schedules.filter(
                    (s) => s.vehicle_id === vehicle.vehicle_id
                  ).length;
                  const assignedRoute =
                    vehicleRouteMap.get(vehicle.vehicle_id) || "—";
                  return (
                    <tr
                      key={vehicle.vehicle_id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm font-medium text-black">
                        {vehicle.vehicle_id}
                      </td>
                      <td className="py-3 px-4 text-sm text-black">
                        {vehicle.plate_number}
                      </td>
                      <td className="py-3 px-4 text-sm text-black">
                        {vehicle.capacity} seats
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <StatusBadge status={vehicle.status} />
                      </td>
                      <td className="py-3 px-4 text-sm text-black">
                        {assignedRoute}
                      </td>
                      <td className="py-3 px-4 text-sm text-black">
                        {todaysTrips}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {vehicle.status === "ACTIVE" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              openDialog(
                                vehicle.vehicle_id,
                                vehicle.plate_number
                              )
                            }
                            className="border border-gray-300 text-black hover:bg-red-700 hover:text-white rounded-md"
                          >
                            Request Trip
                          </Button>
                        )}
                        {vehicle.status === "PENDING" && (
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
        title="Request Sudden Trip"
        description={`This will notify the logistics officer to assign a trip for vehicle ${selectedVehiclePlate}. Do you want to proceed?`}
        confirmText="Yes, Request"
        cancelText="Cancel"
      />
    </div>
  );
}
