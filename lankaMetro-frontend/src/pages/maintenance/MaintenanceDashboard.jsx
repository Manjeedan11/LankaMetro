import { Wrench, CheckCircle, Clock, BusFront } from "lucide-react";
import { useState } from "react";
import StatCard from "@/components/standalone/StatCard";
import StatusBadge from "@/components/standalone/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [formData, setFormData] = useState({
    vehicle: "",
    type: "",
    description: "",
    status: "PENDING",
  });

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
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
          value="3"
          icon={Wrench}
          color="primary"
        />
        <StatCard
          title="Completed Services"
          value="24"
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Pending Services"
          value="2"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Active Vehicles"
          value="42"
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
                <label className="block text-sm font-medium mb-2">
                  Vehicle
                </label>
                <Select
                  value={formData.vehicle}
                  onValueChange={(value) =>
                    handleSelectChange("vehicle", value)
                  }
                >
                  <SelectTrigger className="w-full text-black">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="V001">V001</SelectItem>
                    <SelectItem value="V002">V002</SelectItem>
                    <SelectItem value="V003">V003</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Maintenance Type
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger className="w-full text-black">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Oil Change">Oil Change</SelectItem>
                    <SelectItem value="Brake Service">Brake Service</SelectItem>
                    <SelectItem value="Tire Replacement">
                      Tire Replacement
                    </SelectItem>
                    <SelectItem value="Engine Service">
                      Engine Service
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Maintenance details..."
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
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                </SelectContent>
              </Select>
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
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Vehicle
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Maintenance Type
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
                {maintenanceItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-black">
                      {item.vehicle}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {item.type}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {item.date}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <StatusBadge status={item.status} />
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
