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
  useGetDepotsQuery,
  useCreateDepotMutation,
  useUpdateDepotMutation,
  useDeleteDepotMutation,
} from "@/lib/api";

export default function DepotManagement() {
  const {
    data: depots = [],
    isLoading,
    isError,
    refetch,
  } = useGetDepotsQuery();
  const [createDepot] = useCreateDepotMutation();
  const [updateDepot] = useUpdateDepotMutation();
  const [deleteDepot] = useDeleteDepotMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [formData, setFormData] = useState({
    depot_name: "",
    location: "",
    contact_number: "",
    status: "ACTIVE",
    latitude: "",
    longitude: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert latitude/longitude to numbers or null
      const payload = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };
      if (editingId) {
        await updateDepot({ id: editingId, ...payload }).unwrap();
      } else {
        await createDepot(payload).unwrap();
      }
      refetch();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        depot_name: "",
        location: "",
        contact_number: "",
        status: "ACTIVE",
        latitude: "",
        longitude: "",
      });
    } catch (err) {
      console.error("Failed to save depot:", err);
      alert("Error saving depot");
    }
  };

  const handleEdit = (depot) => {
    setFormData({
      depot_name: depot.depot_name,
      location: depot.location,
      contact_number: depot.contact_number,
      status: depot.status,
      latitude: depot.latitude?.toString() || "",
      longitude: depot.longitude?.toString() || "",
    });
    setEditingId(depot.depot_id);
    setShowForm(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDepot(deleteTargetId).unwrap();
      refetch();
    } catch (err) {
      alert("Delete failed");
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading depots</div>;

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
            depot_name: "",
            location: "",
            contact_number: "",
            status: "ACTIVE",
            latitude: "",
            longitude: "",
          });
          setShowForm(!showForm);
        }}
        className="btn-primary flex items-center gap-2 border text-black hover:text-white"
      >
        <Plus size={20} />
        Add Depot
      </button>

      {showForm && (
        <div className="card overflow-visible">
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
                name="depot_name"
                value={formData.depot_name}
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
                name="contact_number"
                value={formData.contact_number}
                onChange={handleInputChange}
                placeholder="Enter contact number"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Latitude
                </label>
                <Input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  placeholder="e.g., 6.9271"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Longitude
                </label>
                <Input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  placeholder="e.g., 79.8612"
                />
              </div>
            </div>
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
                  ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Name
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
                  key={depot.depot_id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-sm font-medium">
                    {depot.depot_id}
                  </td>
                  <td className="py-3 px-4 text-sm">{depot.depot_name}</td>
                  <td className="py-3 px-4 text-sm">{depot.location}</td>
                  <td className="py-3 px-4 text-sm">{depot.contact_number}</td>
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
                        onClick={() => handleDeleteClick(depot.depot_id)}
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
        title="Delete Depot"
        description="Are you sure you want to delete this depot? This action cannot be undone."
      />
    </div>
  );
}
