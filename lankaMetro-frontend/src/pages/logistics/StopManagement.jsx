import { Plus, Edit2, Trash2, MapPin } from "lucide-react";
import { useState } from "react";
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
  useGetStopsQuery,
  useCreateStopMutation,
  useUpdateStopMutation,
  useDeleteStopMutation,
} from "@/lib/api";
import StatusBadge from "@/components/standalone/StatusBadge";

export default function StopManagement() {
  const { data: stops = [], isLoading, isError, refetch } = useGetStopsQuery();
  const [createStop] = useCreateStopMutation();
  const [updateStop] = useUpdateStopMutation();
  const [deleteStop] = useDeleteStopMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [formData, setFormData] = useState({
    stop_name: "",
    location: "",
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
      if (editingId) {
        await updateStop({ id: editingId, ...formData }).unwrap();
      } else {
        await createStop(formData).unwrap();
      }
      refetch();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        stop_name: "",
        location: "",
        latitude: "",
        longitude: "",
      });
    } catch (err) {
      console.error("Failed to save stop:", err);
      alert("Error saving stop");
    }
  };

  const handleEdit = (stop) => {
    setFormData({
      stop_name: stop.stop_name,
      location: stop.location || "",
      latitude: stop.latitude?.toString() || "",
      longitude: stop.longitude?.toString() || "",
    });
    setEditingId(stop.stop_id);
    setShowForm(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteStop(deleteTargetId).unwrap();
      refetch();
    } catch (err) {
      alert("Delete failed");
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    }
  };

  if (isLoading) return <div>Loading stops...</div>;
  if (isError) return <div>Error loading stops</div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      <div className="page-header">
        <h1 className="page-title">Stop Management</h1>
        <p className="page-description">
          Manage bus stops (required for route preview)
        </p>
      </div>

      <button
        onClick={() => {
          setEditingId(null);
          setFormData({
            stop_name: "",
            location: "",
            latitude: "",
            longitude: "",
            status: "ACTIVE",
          });
          setShowForm(!showForm);
        }}
        className="btn-primary flex items-center gap-2 border text-black hover:text-white"
      >
        <Plus size={20} />
        Add Stop
      </button>

      {showForm && (
        <div className="card overflow-visible">
          <h2 className="text-lg font-semibold mb-4 text-black">
            {editingId ? "Edit Stop" : "Add New Stop"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Stop Name
              </label>
              <Input
                type="text"
                name="stop_name"
                value={formData.stop_name}
                onChange={handleInputChange}
                placeholder="e.g., Colombo Central"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Address / Location
              </label>
              <Input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Street address or description"
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
            <div className="flex gap-2">
              <button
                type="submit"
                className="btn-primary border text-black hover:text-white"
              >
                {editingId ? "Update Stop" : "Add Stop"}
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
        <h2 className="text-lg font-semibold mb-4 text-black">All Stops</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Stop ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Stop Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Location
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Latitude
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Longitude
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {stops.map((stop) => (
                <tr
                  key={stop.stop_id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-sm font-medium text-black">
                    {stop.stop_id}
                  </td>
                  <td className="py-3 px-4 text-sm text-black">
                    {stop.stop_name}
                  </td>
                  <td className="py-3 px-4 text-sm text-black">
                    {stop.location || "-"}
                  </td>
                  <td className="py-3 px-4 text-sm text-black">
                    {stop.latitude || "-"}
                  </td>
                  <td className="py-3 px-4 text-sm text-black">
                    {stop.longitude || "-"}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(stop)}
                        className="p-1.5 hover:bg-gray-200 rounded text-primary"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(stop.stop_id)}
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
        title="Delete Stop"
        description="Are you sure you want to delete this stop? This action cannot be undone."
      />
    </div>
  );
}
