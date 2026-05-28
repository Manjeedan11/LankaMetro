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

const mockHistory = [
  {
    id: "MH001",
    vehicle: "V001",
    service: "Oil Change",
    description: "Regular oil and filter change",
    date: "2024-05-26",
    status: "COMPLETED",
  },
  {
    id: "MH002",
    vehicle: "V002",
    service: "Brake Inspection",
    description: "Brake pads and fluid check",
    date: "2024-05-25",
    status: "COMPLETED",
  },
  {
    id: "MH003",
    vehicle: "V003",
    service: "Tire Replacement",
    description: "All four tires replaced",
    date: "2024-05-24",
    status: "COMPLETED",
  },
  {
    id: "MH004",
    vehicle: "V001",
    service: "Engine Service",
    description: "Engine diagnostic and tune-up",
    date: "2024-05-20",
    status: "COMPLETED",
  },
  {
    id: "MH005",
    vehicle: "V004",
    service: "Transmission Service",
    description: "Fluid change and filter replacement",
    date: "2024-05-15",
    status: "COMPLETED",
  },
];

export default function MaintenanceHistory() {
  const [filterVehicle, setFilterVehicle] = useState("all");
  const [filterService, setFilterService] = useState("all");

  const filteredHistory = mockHistory.filter((item) => {
    const vehicleMatch =
      filterVehicle === "all" || item.vehicle === filterVehicle;
    const serviceMatch =
      filterService === "all" || item.service === filterService;
    return vehicleMatch && serviceMatch;
  });

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
                  <SelectItem value="V001">V001</SelectItem>
                  <SelectItem value="V002">V002</SelectItem>
                  <SelectItem value="V003">V003</SelectItem>
                  <SelectItem value="V004">V004</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Service Type
              </label>
              <Select value={filterService} onValueChange={setFilterService}>
                <SelectTrigger className="w-full text-black">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="Oil Change">Oil Change</SelectItem>
                  <SelectItem value="Brake Inspection">
                    Brake Inspection
                  </SelectItem>
                  <SelectItem value="Tire Replacement">
                    Tire Replacement
                  </SelectItem>
                  <SelectItem value="Engine Service">Engine Service</SelectItem>
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
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-black">
                      {record.id}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {record.vehicle}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {record.service}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {record.description}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {record.date}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <StatusBadge status={record.status} />
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
