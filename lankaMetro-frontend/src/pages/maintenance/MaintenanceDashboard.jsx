import { Wrench, CheckCircle, Clock, BusFront } from "lucide-react";
import { useState } from "react";
import StatCard from "@/components/standalone/StatCard";
import StatusBadge from "@/components/standalone/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSelector } from "react-redux";
import {  useGetVehiclesQuery,  useGetMaintenanceRecordsQuery,  useCreateMaintenanceMutation,  useCompleteMaintenanceMutation,} from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const maintenanceItems = [
  {
    id: "M001",
    vehicle: "V001",
    type: "Oil Change",
    date: "2024-05-26",
    status: "COMPLETED",
  },
  {
    id: "M002",
    vehicle: "V002",
    type: "Brake Inspection",
    date: "2024-05-25",
    status: "COMPLETED",
  },
  {
    id: "M003",
    vehicle: "V004",
    type: "Engine Service",
    date: "2024-05-24",
    status: "PENDING",
  },
];

export default function MaintenanceDashboard() {
  
const { data: vehicles = [] } = useGetVehiclesQuery();  
const { data: maintenanceRecords = [], refetch } = useGetMaintenanceRecordsQuery();  
const [createMaintenance] = useCreateMaintenanceMutation();  
const [completeMaintenance] = useCompleteMaintenanceMutation();
const [formData, setFormData] = useState({
    vehicle: "",
    type: "",
    serviceDate: "",
    description: "",
    status: "PENDING",
  });

  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === "ACTIVE").length;
  const inMaintenance = vehicles.filter(v => v.status === "MAINTENANCE").length;
  const completedServices = maintenanceRecords.filter(m => m.status === "COMPLETED").length;
  const pendingServices = maintenanceRecords.filter(m => m.status === "PENDING" || m.status === "SCHEDULED").length;

  

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

 

  const buttonBase =
    "border border-gray-300 text-black hover:bg-red-700 hover:text-white transition-colors";

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-8">
      <div className="page-header">
        <h1 className="page-title">Maintenance Dashboard</h1>
        <p className="page-description">Track vehicle maintenance schedules</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="In Maintenance"
          value={inMaintenance}
          icon={Wrench}
          color="primary"
        />
        <StatCard
          title="Completed Services"
          value={completedServices}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Pending Services"
          value={pendingServices}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Active Vehicles"
          value={activeVehicles}
          icon={BusFront}
          color="purple"
        />
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Add Maintenance Record</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Vehicle</label>
                <Select
                  value={formData.vehicle_id}
                  onValueChange={(value) => handleSelectChange("vehicle_id", value)}
                >
                  <SelectTrigger className="w-full text-black">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.vehicle_id} value={v.vehicle_id.toString()}>
                        {v.plate_number} ({v.vehicle_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Maintenance Type</label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger className="w-full text-black">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OIL_CHANGE">Oil Change</SelectItem>
                    <SelectItem value="BRAKE_SERVICE">Brake Service</SelectItem>
                    <SelectItem value="TIRE_REPLACEMENT">Tire Replacement</SelectItem>
                    <SelectItem value="ENGINE_SERVICE">Engine Service</SelectItem>
                    <SelectItem value="INSPECTION">Inspection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Service Date</label>
                <Input
                  type="date"
                  name="service_date"
                  value={formData.service_date}
                  onChange={handleInputChange}
                  required
                  className="text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger className="w-full text-black">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCHEDULED">SCHEDULED</SelectItem>
                    <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                    <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Maintenance details..."
                className="text-black"
              />
            </div>
            <Button type="submit" className={`bg-primary ${buttonBase}`}>
              Add Record
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vehicle</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Maintenance Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceRecords.map((item) => (
                  <tr key={item.maintenance_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-black">
                      {item.plate_number || item.vehicle_id}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">{item.type.replace(/_/g, " ")}</td>
                    <td className="py-3 px-4 text-sm text-black">{item.service_date}</td>
                    <td className="py-3 px-4 text-sm">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {item.status === "IN_PROGRESS" && (
                        <button
                          onClick={() => handleComplete(item.maintenance_id)}
                          className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                        >
                          Complete
                        </button>
                      )}
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
