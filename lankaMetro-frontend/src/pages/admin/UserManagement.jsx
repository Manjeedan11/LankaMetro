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

const mockUsers = [
  {
    id: "U001",
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    depot: "Colombo Central",
    status: "ACTIVE",
  },
  {
    id: "U002",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Logistics Officer",
    depot: "Kandy Hub",
    status: "ACTIVE",
  },
  {
    id: "U003",
    name: "Mike Brown",
    email: "mike@example.com",
    role: "Depot Supervisor",
    depot: "Galle",
    status: "ACTIVE",
  },
  {
    id: "U004",
    name: "Sarah Davis",
    email: "sarah@example.com",
    role: "Maintenance Officer",
    depot: "Colombo Central",
    status: "INACTIVE",
  },
];

export default function UserManagement() {
  const [users, setUsers] = useState(mockUsers);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    depot: "",
    status: "ACTIVE",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({ ...prev, role: value }));
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
      setUsers(
        users.map((u) => (u.id === editingId ? { ...u, ...formData } : u))
      );
      setEditingId(null);
    } else {
      const newUser = {
        id: `U${String(users.length + 1).padStart(3, "0")}`,
        ...formData,
      };
      setUsers([...users, newUser]);
    }
    setFormData({ name: "", email: "", role: "", depot: "", status: "ACTIVE" });
    setShowForm(false);
  };

  const handleEdit = (user) => {
    setFormData(user);
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-description">Manage system users and roles</p>
      </div>

      <button
        onClick={() => {
          setEditingId(null);
          setFormData({
            name: "",
            email: "",
            role: "",
            depot: "",
            status: "ACTIVE",
          });
          setShowForm(!showForm);
        }}
        className="btn-primary flex items-center gap-2 border text-black hover:text-white"
      >
        <Plus size={20} />
        Add User
      </button>

      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 text-black">
            {editingId ? "Edit User" : "Add New User"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                required
                className="text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
                required
                className="text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <Select onValueChange={handleRoleChange} value={formData.role}>
                <SelectTrigger className="w-full text-black">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Logistics Officer">
                    Logistics Officer
                  </SelectItem>
                  <SelectItem value="Depot Supervisor">
                    Depot Supervisor
                  </SelectItem>
                  <SelectItem value="Maintenance Officer">
                    Maintenance Officer
                  </SelectItem>
                  <SelectItem value="Driver">Driver</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Assigned Depot
              </label>
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
                  <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="btn-primary border text-black hover:text-white"
              >
                {editingId ? "Update User" : "Add User"}
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
        <h2 className="text-lg font-semibold mb-4 text-black">All Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  User ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Role
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
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-sm font-medium text-black">
                    {user.id}
                  </td>
                  <td className="py-3 px-4 text-sm text-black">{user.name}</td>
                  <td className="py-3 px-4 text-sm text-black">{user.email}</td>
                  <td className="py-3 px-4 text-sm text-black">{user.role}</td>
                  <td className="py-3 px-4 text-sm text-black">{user.depot}</td>
                  <td className="py-3 px-4 text-sm">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1.5 hover:bg-gray-200 rounded text-primary"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
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
