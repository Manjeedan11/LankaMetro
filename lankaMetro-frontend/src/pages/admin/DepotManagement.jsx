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

const mockDepots = [
  {
    id: "D001",
    name: "Colombo Central",
    location: "Colombo",
    contact: "+94112223333",
    status: "ACTIVE",
  },
  {
    id: "D002",
    name: "Kandy Transport Hub",
    location: "Kandy",
    contact: "+94812334455",
    status: "ACTIVE",
  },
  {
    id: "D003",
    name: "Galle Depot",
    location: "Galle",
    contact: "+94912445566",
    status: "ACTIVE",
  },
  {
    id: "D004",
    name: "Jaffna Station",
    location: "Jaffna",
    contact: "+94212556677",
    status: "INACTIVE",
  },
];

export default function DepotManagement() {
  const [depots, setDepots] = useState(mockDepots);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    contact: "",
    status: "ACTIVE",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setDepots(
        depots.map((d) => (d.id === editingId ? { ...d, ...formData } : d))
      );
      setEditingId(null);
    } else {
      const newDepot = {
        id: `D${String(depots.length + 1).padStart(3, "0")}`,
        ...formData,
      };
      setDepots([...depots, newDepot]);
    }
    setFormData({ name: "", location: "", contact: "", status: "ACTIVE" });
    setShowForm(false);
  };

  const handleEdit = (depot) => {
    setFormData(depot);
    setEditingId(depot.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setDepots(depots.filter((d) => d.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      <div className="page-header">
        <h1 className="page-title">Depot Management</h1>
        <p className="page-description">Manage all transport depots</p>
      </div>

      <button
        onClick={() => {
          setEditingId(null);
          setFormData({
            name: "",
            location: "",
            contact: "",
            status: "ACTIVE",
          });
          setShowForm(!showForm);
        }}
        className="btn-primary flex items-center gap-2 border text-black hover:text-white"
      >
        <Plus size={20} />
        Add Depot
      </button>

      {showForm && (
        <div className="card">
          <h2 className="text-lg text-black font-semibold mb-4">
            {editingId ? "Edit Depot" : "Add New Depot"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Depot Name
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter depot name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <Input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter location"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Contact Number
              </label>
              <Input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                placeholder="Enter contact number"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="btn-primary border text-black hover:text-white"
              >
                {editingId ? "Update Depot" : "Add Depot"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg text-black font-semibold mb-4">All Depots</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Depot ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Depot Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Location
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Contact
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
              {depots.map((depot) => (
                <tr
                  key={depot.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-sm font-medium">{depot.id}</td>
                  <td className="py-3 px-4 text-sm">{depot.name}</td>
                  <td className="py-3 px-4 text-sm">{depot.location}</td>
                  <td className="py-3 px-4 text-sm">{depot.contact}</td>
                  <td className="py-3 px-4 text-sm">
                    <StatusBadge status={depot.status} />
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(depot)}
                        className="p-1.5 hover:bg-gray-200 rounded text-primary"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(depot.id)}
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
