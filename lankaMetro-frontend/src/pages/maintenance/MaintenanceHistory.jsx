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
import {
  useGetMaintenanceRecordsQuery,
  useGetVehiclesQuery,
} from "@/lib/api";

export default function MaintenanceHistory() {
  const { data: maintenanceRecords = [], isLoading, isError } = useGetMaintenanceRecordsQuery();
  const { data: vehicles = [] } = useGetVehiclesQuery();

  const [filterVehicle, setFilterVehicle] = useState("all");
  const [filterService, setFilterService] = useState("all");
  
  const vehicleOptions = Array.from(
    new Map(
      maintenanceRecords.map(record => [
        record.vehicle_id,
        { id: record.vehicle_id, name: record.plate_number || `Vehicle ${record.vehicle_id}` }
      ])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const serviceOptions = Array.from(
    new Set(maintenanceRecords.map(record => record.type))
  ).sort();


  const filteredRecords = maintenanceRecords.filter(record => {
    const vehicleMatch = filterVehicle === "all" || record.vehicle_id.toString() === filterVehicle;
    const serviceMatch = filterService === "all" || record.type === filterService;
    return vehicleMatch && serviceMatch;
  });

   if (isLoading) return <div className="container mx-auto px-4 py-6">Loading maintenance records...</div>;
  if (isError) return <div className="container mx-auto px-4 py-6 text-red-600">Error loading maintenance records.</div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      <div className="page-header">
        <h1 className="page-title">Maintenance History</h1>
        <p className="page-description">
          Complete maintenance records for all vehicles
        </p>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Filter size={20} />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Vehicle</label>
              <Select value={filterVehicle} onValueChange={setFilterVehicle}>
                <SelectTrigger className="w-full text-black">
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vehicles</SelectItem>
                  {vehicleOptions.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                      {vehicle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Service Type</label>
              <Select value={filterService} onValueChange={setFilterService}>
                <SelectTrigger className="w-full text-black">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {serviceOptions.map(service => (
                    <SelectItem key={service} value={service}>
                      {service.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Maintenance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Record ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Vehicle
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Service Type
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </td>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-gray-500">
                      No maintenance records found.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.maintenance_id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-black">
                        {record.maintenance_id}
                      </td>
                      <td className="py-3 px-4 text-sm text-black">
                        {record.plate_number || `Vehicle ${record.vehicle_id}`}
                      </td>
                      <td className="py-3 px-4 text-sm text-black">
                        {record.type.replace(/_/g, " ")}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {record.description || "—"}
                      </td>
                      <td className="py-3 px-4 text-sm text-black">
                        {record.service_date}
                      </td>
                      <td className="py-3 px-4 text-sm">
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
