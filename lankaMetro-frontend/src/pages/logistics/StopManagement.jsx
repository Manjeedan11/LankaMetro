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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DeleteConfirmDialog from "@/components/standalone/DeleteConfirmDialog";
import {
  useGetStopsQuery,
  useCreateStopMutation,
  useUpdateStopMutation,
  useDeleteStopMutation,
} from "@/lib/api";

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

  const buttonBase =
    "border border-gray-300 text-black hover:bg-red-700 hover:text-white transition-colors";

  if (isLoading) return <div>Loading stops...</div>;
  if (isError) return <div>Error loading stops</div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-4">
      <div>
        <h1 className="page-title">Stop Management</h1>
        <p className="page-description">
          Manage bus stops (required for route preview)
        </p>
      </div>

      <Button
        onClick={() => {
          setEditingId(null);
          setFormData({
            stop_name: "",
            location: "",
            latitude: "",
            longitude: "",
          });
          setShowForm(!showForm);
        }}
        className={`bg-primary ${buttonBase}`}
      >
        <Plus size={20} />
        Add Stop
      </Button>

      {showForm && (
        <Card className="border border-gray-200 shadow-sm max-w-2xl overflow-visible bg-white">
          <CardHeader className="bg-white">
            <CardTitle>{editingId ? "Edit Stop" : "Add New Stop"}</CardTitle>
          </CardHeader>
          <CardContent className="bg-white">
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
                  className="w-full"
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
                  className="w-full"
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
                    className="w-full"
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
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className={`bg-primary ${buttonBase}`}>
                  {editingId ? "Update Stop" : "Add Stop"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className={buttonBase}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="bg-white">
          <CardTitle>All Stops</CardTitle>
        </CardHeader>
        <CardContent className="bg-white p-0">
          <div className="overflow-x-auto bg-white">
            <table className="w-full bg-white">
              <thead className="bg-white">
                <tr className="border-b border-gray-200 bg-white">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-white">
                    Stop ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-white">
                    Stop Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-white">
                    Location
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-white">
                    Latitude
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-white">
                    Longitude
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {stops.map((stop) => (
                  <tr
                    key={stop.stop_id}
                    className="border-b border-gray-100 hover:bg-gray-50 bg-white"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-black bg-white">
                      {stop.stop_id}
                    </td>
                    <td className="py-3 px-4 text-sm text-black bg-white">
                      {stop.stop_name}
                    </td>
                    <td className="py-3 px-4 text-sm text-black bg-white">
                      {stop.location || "-"}
                    </td>
                    <td className="py-3 px-4 text-sm text-black bg-white">
                      {stop.latitude || "-"}
                    </td>
                    <td className="py-3 px-4 text-sm text-black bg-white">
                      {stop.longitude || "-"}
                    </td>
                    <td className="py-3 px-4 text-sm bg-white">
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
        </CardContent>
      </Card>

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
