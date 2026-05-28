import { Plus, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import StatusBadge from "@/components/standalone/StatusBadge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockVehicles = [
  {
    id: "V001",
    plate: "WP-CD-1234",
    capacity: 45,
    fuelType: "Diesel",
    depot: "Colombo Central",
    status: "ACTIVE",
  },
  {
    id: "V002",
    plate: "WP-CD-1235",
    capacity: 50,
    fuelType: "Diesel",
    depot: "Kandy Hub",
    status: "MAINTENANCE",
  },
  {
    id: "V003",
    plate: "WP-CD-1236",
    capacity: 45,
    fuelType: "CNG",
    depot: "Galle",
    status: "ACTIVE",
  },
  {
    id: "V004",
    plate: "WP-CD-1237",
    capacity: 40,
    fuelType: "Diesel",
    depot: "Colombo Central",
    status: "RETIRED",
  },
];

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    plate: "",
    capacity: "",
    fuelType: "",
    depot: "",
    status: "ACTIVE",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFuelTypeChange = (value) => {
    setFormData((prev) => ({ ...prev, fuelType: value }));
  };

  const handleDepotChange = (value) => {
    setFormData((prev) => ({ ...prev, depot: value }));
  };

  const handleStatusChange = (value) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setVehicles(
        vehicles.map((v) => (v.id === editingId ? { ...v, ...formData } : v))
      );
      setEditingId(null);
    } else {
      const newVehicle = {
        id: `V${String(vehicles.length + 1).padStart(3, "0")}`,
        ...formData,
        capacity: parseInt(formData.capacity),
      };
      setVehicles([...vehicles, newVehicle]);
    }
    setFormData({
      plate: "",
      capacity: "",
      fuelType: "",
      depot: "",
      status: "ACTIVE",
    });
    setShowForm(false);
  };

  const handleEdit = (vehicle) => {
    setFormData(vehicle);
    setEditingId(vehicle.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setVehicles(vehicles.filter((v) => v.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      <div className="page-header">
        <h1 className="page-title">Vehicle Management</h1>
        <p className="page-description">Manage all transport vehicles</p>
      </div>

      <button
        onClick={() => {
          setEditingId(null);
          setFormData({
            plate: "",
            capacity: "",
            fuelType: "",
            depot: "",
            status: "ACTIVE",
          });
          setShowForm(!showForm);
        }}
        className="btn-primary flex items-center gap-2 border text-black hover:text-white"
      >
        <Plus size={20} />
        Add Vehicle
      </button>

      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 text-black">
            {editingId ? "Edit Vehicle" : "Add New Vehicle"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Plate Number
              </label>
              <Input
                type="text"
                name="plate"
                value={formData.plate}
                onChange={handleInputChange}
                placeholder="e.g., WP-CD-1234"
                required
                className="text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Capacity (seats)
              </label>
              <Input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                placeholder="Enter capacity"
                required
                className="text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Fuel Type
              </label>
              <Select
                onValueChange={handleFuelTypeChange}
                value={formData.fuelType}
              >
                <SelectTrigger className="w-full text-black">
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="CNG">CNG</SelectItem>
                  <SelectItem value="Electric">Electric</SelectItem>
                  <SelectItem value="Petrol">Petrol</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Depot</label>
              <Select onValueChange={handleDepotChange} value={formData.depot}>
                <SelectTrigger className="w-full text-black">
                  <SelectValue placeholder="Select depot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Colombo Central">
                    Colombo Central
                  </SelectItem>
                  <SelectItem value="Kandy Hub">Kandy Hub</SelectItem>
                  <SelectItem value="Galle">Galle</SelectItem>
                  <SelectItem value="Jaffna">Jaffna</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select
                onValueChange={handleStatusChange}
                value={formData.status}
              >
                <SelectTrigger className="w-full text-black">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="MAINTENANCE">MAINTENANCE</SelectItem>
                  <SelectItem value="RETIRED">RETIRED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="btn-primary border text-black hover:text-white"
              >
                {editingId ? "Update Vehicle" : "Add Vehicle"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="btn-secondary border hover:bg-red-700 text-black hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold mb-4 text-black">All Vehicles</h2>
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
                  Fuel Type
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Depot
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
              {vehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-sm font-medium text-black">
                    {vehicle.id}
                  </td>
                  <td className="py-3 px-4 text-sm text-black">
                    {vehicle.plate}
                  </td>
                  <td className="py-3 px-4 text-sm text-black">
                    {vehicle.capacity} seats
                  </td>
                  <td className="py-3 px-4 text-sm text-black">
                    {vehicle.fuelType}
                  </td>
                  <td className="py-3 px-4 text-sm text-black">
                    {vehicle.depot}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <StatusBadge status={vehicle.status} />
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="p-1.5 hover:bg-gray-200 rounded text-primary"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="p-1.5 hover:bg-gray-200 rounded text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
