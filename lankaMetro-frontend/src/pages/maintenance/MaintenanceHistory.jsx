import { Filter } from "lucide-react";
import { useState } from "react";
import StatusBadge from "@/components/standalone/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetMaintenanceRecordsQuery, useGetVehiclesQuery } from "@/lib/api";

export default function MaintenanceHistory() {
  const {
    data: maintenanceRecords = [],
    isLoading,
    isError,
  } = useGetMaintenanceRecordsQuery();
  const { data: vehicles = [] } = useGetVehiclesQuery();

  const [filterVehicle, setFilterVehicle] = useState("all");
  const [filterService, setFilterService] = useState("all");

  const vehicleOptions = Array.from(
    new Map(
      maintenanceRecords.map((record) => [
        record.vehicle_id,
        {
          id: record.vehicle_id,
          name: record.plate_number || `Vehicle ${record.vehicle_id}`,
        },
      ])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const serviceOptions = Array.from(
    new Set(maintenanceRecords.map((record) => record.type))
  ).sort();

  const filteredRecords = maintenanceRecords.filter((record) => {
    const vehicleMatch =
      filterVehicle === "all" || record.vehicle_id.toString() === filterVehicle;
    const serviceMatch =
      filterService === "all" || record.type === filterService;
    return vehicleMatch && serviceMatch;
  });

  if (isLoading)
    return (
      <div className="container mx-auto px-4 py-6">
        Loading maintenance records...
      </div>
    );
  if (isError)
    return (
      <div className="container mx-auto px-4 py-6 text-red-600">
        Error loading maintenance records.
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      <div className="page-header">
        <h1 className="page-title">Maintenance History</h1>
        <p className="page-description">
          Complete maintenance records for all vehicles
        </p>
      </div>

      {/* Filter Card – compact styling */}
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="bg-white pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Filter size={18} />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          <div className="flex flex-wrap items-end gap-3">
            {/* Vehicle */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Vehicle
              </label>
              <Select value={filterVehicle} onValueChange={setFilterVehicle}>
                <SelectTrigger className="w-full bg-white text-black h-8 text-sm">
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white border border-gray-200 rounded-md shadow-lg">
                  <SelectItem
                    value="all"
                    className="text-black hover:bg-gray-100"
                  >
                    All Vehicles
                  </SelectItem>
                  {vehicleOptions.map((vehicle) => (
                    <SelectItem
                      key={vehicle.id}
                      value={vehicle.id.toString()}
                      className="text-black hover:bg-gray-100"
                    >
                      {vehicle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Service Type */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Service Type
              </label>
              <Select value={filterService} onValueChange={setFilterService}>
                <SelectTrigger className="w-full bg-white text-black h-8 text-sm">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white border border-gray-200 rounded-md shadow-lg">
                  <SelectItem
                    value="all"
                    className="text-black hover:bg-gray-100"
                  >
                    All Services
                  </SelectItem>
                  {serviceOptions.map((service) => (
                    <SelectItem
                      key={service}
                      value={service}
                      className="text-black hover:bg-gray-100"
                    >
                      {service.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="bg-white">
          <CardTitle className="text-base font-semibold">
            Maintenance Records
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-white p-0">
          <div className="overflow-x-auto bg-white">
            <table className="w-full bg-white">
              <thead className="bg-white">
                <tr className="border-b border-gray-200 bg-white">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-white">
                    Record ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-white">
                    Vehicle
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-white">
                    Service Type
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-white">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-white">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-white">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-6 text-gray-500 bg-white"
                    >
                      No maintenance records found.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr
                      key={record.maintenance_id}
                      className="border-b border-gray-100 hover:bg-gray-50 bg-white"
                    >
                      <td className="py-3 px-4 text-sm font-medium text-black bg-white">
                        {record.maintenance_id}
                      </td>
                      <td className="py-3 px-4 text-sm text-black bg-white">
                        {record.plate_number || `Vehicle ${record.vehicle_id}`}
                      </td>
                      <td className="py-3 px-4 text-sm text-black bg-white">
                        {record.type.replace(/_/g, " ")}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 bg-white">
                        {record.description || "—"}
                      </td>
                      <td className="py-3 px-4 text-sm text-black bg-white">
                        {record.service_date}
                      </td>
                      <td className="py-3 px-4 text-sm bg-white">
                        <StatusBadge status={record.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
