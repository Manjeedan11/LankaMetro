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
import DeleteConfirmDialog from "@/components/standalone/DeleteConfirmDialog";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetDepotsQuery,
} from "@/lib/api";

export default function UserManagement() {
  const {
    data: users = [],
    isLoading: usersLoading,
    isError: usersError,
    refetch,
  } = useGetUsersQuery();
  const { data: depots = [], isLoading: depotsLoading } = useGetDepotsQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "",
    depot_id: "",
    status: "ACTIVE",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { password, ...updateData } = formData;
        await updateUser({ id: editingId, ...updateData }).unwrap();
      } else {
        await createUser(formData).unwrap();
      }
      refetch();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        full_name: "",
        email: "",
        password: "",
        role: "",
        depot_id: "",
        status: "ACTIVE",
      });
    } catch (err) {
      console.error("Failed to save user:", err);
      alert("Error saving user");
    }
  };

  const handleEdit = (user) => {
    setFormData({
      full_name: user.full_name,
      email: user.email,
      password: "",
      role: user.role,
      depot_id: user.depot_id?.toString() || "",
      status: user.status,
    });
    setEditingId(user.user_id);
    setShowForm(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(deleteTargetId).unwrap();
      refetch();
    } catch (err) {
      alert("Delete failed");
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    }
  };

  if (usersLoading) return <div>Loading users...</div>;
  if (usersError) return <div>Error loading users</div>;

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
            full_name: "",
            email: "",
            password: "",
            role: "",
            depot_id: "",
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
        <div className="card overflow-visible">
          <h2 className="text-lg font-semibold mb-4 text-black">
            {editingId ? "Edit User" : "Add New User"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <Input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                required
              />
            </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
                required
              />
            </div>
            {/* Password (only for creation) */}
            {!editingId && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  required
                />
              </div>
            )}
            {/* Role */}
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="z-50 bg-white border border-gray-200 rounded-md shadow-lg"
                >
                  <SelectItem
                    value="admin"
                    className="text-black hover:bg-gray-100"
                  >
                    Admin
                  </SelectItem>
                  <SelectItem
                    value="logistics_officer"
                    className="text-black hover:bg-gray-100"
                  >
                    Logistics Officer
                  </SelectItem>
                  <SelectItem
                    value="depot_supervisor"
                    className="text-black hover:bg-gray-100"
                  >
                    Depot Supervisor
                  </SelectItem>
                  <SelectItem
                    value="maintenance_officer"
                    className="text-black hover:bg-gray-100"
                  >
                    Maintenance Officer
                  </SelectItem>
                  <SelectItem
                    value="driver"
                    className="text-black hover:bg-gray-100"
                  >
                    Driver
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Assigned Depot */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Assigned Depot
              </label>
              <Select
                value={formData.depot_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, depot_id: value }))
                }
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select depot" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="z-50 bg-white border border-gray-200 rounded-md shadow-lg"
                >
                  {depotsLoading ? (
                    <SelectItem value="" disabled className="text-black">
                      Loading...
                    </SelectItem>
                  ) : (
                    depots.map((depot) => (
                      <SelectItem
                        key={depot.depot_id}
                        value={depot.depot_id.toString()}
                        className="text-black hover:bg-gray-100"
                      >
                        {depot.depot_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="z-50 bg-white border border-gray-200 rounded-md shadow-lg"
                >
                  <SelectItem
                    value="ACTIVE"
                    className="text-black hover:bg-gray-100"
                  >
                    ACTIVE
                  </SelectItem>
                  <SelectItem
                    value="INACTIVE"
                    className="text-black hover:bg-gray-100"
                  >
                    INACTIVE
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Buttons */}
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

      {/* Users Table */}
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
                  key={user.user_id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-sm font-medium text-black">
                    {user.user_id}
                  </td>
                  <td className="py-3 px-4 text-sm text-black">
                    {user.full_name}
                  </td>
                  <td className="py-3 px-4 text-sm text-black">{user.email}</td>
                  <td className="py-3 px-4 text-sm text-black">{user.role}</td>
                  <td className="py-3 px-4 text-sm text-black">
                    {depots.find((d) => d.depot_id === user.depot_id)
                      ?.depot_name ||
                      (user.depot_id ? `Depot ${user.depot_id}` : "None")}
                  </td>
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
                        onClick={() => handleDeleteClick(user.user_id)}
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

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
}
