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
  useGetVehiclesQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
  useGetDepotsQuery,
} from "@/lib/api";

export default function VehicleManagement() {
  const {
    data: vehicles = [],
    isLoading,
    isError,
    refetch,
  } = useGetVehiclesQuery();
  const { data: depots = [], isLoading: depotsLoading } = useGetDepotsQuery();
  const [createVehicle] = useCreateVehicleMutation();
  const [updateVehicle] = useUpdateVehicleMutation();
  const [deleteVehicle] = useDeleteVehicleMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [formData, setFormData] = useState({
    plate_number: "",
    capacity: "",
    fuel_type: "",
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
        await updateVehicle({ id: editingId, ...formData }).unwrap();
      } else {
        await createVehicle(formData).unwrap();
      }
      refetch();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        plate_number: "",
        capacity: "",
        fuel_type: "",
        depot_id: "",
        status: "ACTIVE",
      });
    } catch (err) {
      console.error("Failed to save vehicle:", err);
      alert("Error saving vehicle");
    }
  };

  const handleEdit = (vehicle) => {
    setFormData({
      plate_number: vehicle.plate_number,
      capacity: vehicle.capacity.toString(),
      fuel_type: vehicle.fuel_type,
      depot_id: vehicle.depot_id.toString(),
      status: vehicle.status,
    });
    setEditingId(vehicle.vehicle_id);
    setShowForm(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteVehicle(deleteTargetId).unwrap();
      refetch();
    } catch (err) {
      alert("Delete failed");
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    }
  };

  if (isLoading) return <div>Loading vehicles...</div>;
  if (isError) return <div>Error loading vehicles</div>;

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
            plate_number: "",
            capacity: "",
            fuel_type: "",
            depot_id: "",
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
        <div className="card overflow-visible">
          <h2 className="text-lg font-semibold mb-4 text-black">
            {editingId ? "Edit Vehicle" : "Add New Vehicle"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Plate Number */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Plate Number
              </label>
              <Input
                type="text"
                name="plate_number"
                value={formData.plate_number}
                onChange={handleInputChange}
                placeholder="e.g., WP-CD-1234"
                required
              />
            </div>
            {/* Capacity */}
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
              />
            </div>
            {/* Fuel Type */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Fuel Type
              </label>
              <Select
                value={formData.fuel_type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, fuel_type: value }))
                }
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="z-50 bg-white border border-gray-200 rounded-md shadow-lg"
                >
                  <SelectItem
                    value="DIESEL"
                    className="text-black hover:bg-gray-100"
                  >
                    Diesel
                  </SelectItem>
                  <SelectItem
                    value="CNG"
                    className="text-black hover:bg-gray-100"
                  >
                    CNG
                  </SelectItem>
                  <SelectItem
                    value="ELECTRIC"
                    className="text-black hover:bg-gray-100"
                  >
                    Electric
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Depot */}
            <div>
              <label className="block text-sm font-medium mb-2">Depot</label>
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
                    value="MAINTENANCE"
                    className="text-black hover:bg-gray-100"
                  >
                    MAINTENANCE
                  </SelectItem>
                  <SelectItem
                    value="RETIRED"
                    className="text-black hover:bg-gray-100"
                  >
                    RETIRED
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

      {/* Vehicles Table */}
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
                  key={vehicle.vehicle_id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-sm font-medium text-black">
                    {vehicle.vehicle_id}
                  </td>
                  <td className="py-3 px-4 text-sm text-black">
                    {vehicle.plate_number}
                  </td>
                  <td className="py-3 px-4 text-sm text-black">
                    {vehicle.capacity} seats
                  </td>
                  <td className="py-3 px-4 text-sm text-black">
                    {vehicle.fuel_type}
                  </td>
                  <td className="py-3 px-4 text-sm text-black">
                    {depots.find((d) => d.depot_id === vehicle.depot_id)
                      ?.depot_name || `Depot ${vehicle.depot_id}`}
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
                        onClick={() => handleDeleteClick(vehicle.vehicle_id)}
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
        title="Delete Vehicle"
        description="Are you sure you want to delete this vehicle? This action cannot be undone."
      />
    </div>
  );
}
