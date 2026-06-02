import { Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import StatusBadge from "@/components/standalone/StatusBadge";
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
  useGetSchedulesQuery,
  useGetRoutesQuery,
  useGetDriversQuery,
  useGetVehiclesQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
} from "@/lib/api";

export default function ScheduleManagement() {
  // Queries
  const { data: schedules = [], refetch } = useGetSchedulesQuery();
  const { data: routes = [] } = useGetRoutesQuery();
  const { data: drivers = [] } = useGetDriversQuery();
  const { data: vehicles = [] } = useGetVehiclesQuery();

  // Mutations
  const [createSchedule] = useCreateScheduleMutation();
  const [updateSchedule] = useUpdateScheduleMutation();
  const [deleteSchedule] = useDeleteScheduleMutation();

  // Local state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [formData, setFormData] = useState({
    route_id: "",
    driver_id: "",
    vehicle_id: "",
    departure_time: "",
    arrival_time: "",
    schedule_date: "",
    generate_return: false,
    // return times are calculated on backend, not stored in form
  });
  const [alerts, setAlerts] = useState([]);

  // Helper to format time from "HH:MM:SS" to "HH:MM" for input[type=time]
  const formatTimeForInput = (timeStr) => {
    if (!timeStr) return "";
    const parts = timeStr.split(":");
    if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
    return timeStr;
  };

  // Pre-fill times when editing (if schedule has departure_time/arrival_time)
  useEffect(() => {
    if (editingId && schedules.length) {
      const schedule = schedules.find((s) => s.schedule_id === editingId);
      if (schedule) {
        setFormData({
          route_id: schedule.route_id?.toString() || "",
          driver_id: schedule.driver_id?.toString() || "",
          vehicle_id: schedule.vehicle_id?.toString() || "",
          departure_time: formatTimeForInput(schedule.departure_time),
          arrival_time: formatTimeForInput(schedule.arrival_time),
          schedule_date: schedule.schedule_date || "",
          generate_return: false, // return trip is separate; we don't edit it here
        });
      }
    }
  }, [editingId, schedules]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlerts([]);
    try {
      if (editingId) {
        await updateSchedule({ id: editingId, ...formData }).unwrap();
      } else {
        await createSchedule(formData).unwrap();
      }
      refetch();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        route_id: "",
        driver_id: "",
        vehicle_id: "",
        departure_time: "",
        arrival_time: "",
        schedule_date: "",
        generate_return: false,
      });
    } catch (err) {
      console.error("Failed to save schedule:", err);
      // Extract validation error messages from backend response
      const message = err?.data?.message || "Error saving schedule";
      setAlerts([message]);
      // If the backend returns multiple errors, you can handle accordingly
    }
  };

  const handleEdit = (schedule) => {
    setEditingId(schedule.schedule_id);
    setShowForm(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteSchedule(deleteTargetId).unwrap();
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

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      <div className="page-header">
        <h1 className="page-title">Schedule Management</h1>
        <p className="page-description">Create and manage trip schedules</p>
      </div>

      {alerts.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertCircle
                className="text-yellow-600 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">
                  Validation Alerts
                </h3>
                <ul className="space-y-1">
                  {alerts.map((alert, idx) => (
                    <li key={idx} className="text-sm text-yellow-800">
                      • {alert}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={() => {
          setEditingId(null);
          setFormData({
            route_id: "",
            driver_id: "",
            vehicle_id: "",
            departure_time: "",
            arrival_time: "",
            schedule_date: "",
            generate_return: false,
          });
          setAlerts([]);
          setShowForm(!showForm);
        }}
        className={`bg-primary ${buttonBase}`}
      >
        <Plus size={20} />
        Create Schedule
      </Button>

      {showForm && (
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle>
              {editingId ? "Edit Schedule" : "Create New Schedule"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Route
                  </label>
                  <Select
                    value={formData.route_id}
                    onValueChange={(value) =>
                      handleSelectChange("route_id", value)
                    }
                  >
                    <SelectTrigger className="w-full text-black">
                      <SelectValue placeholder="Select route" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.map((route) => (
                        <SelectItem
                          key={route.route_id}
                          value={route.route_id.toString()}
                        >
                          {route.route_name} ({route.route_no})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Assign Driver
                  </label>
                  <Select
                    value={formData.driver_id}
                    onValueChange={(value) =>
                      handleSelectChange("driver_id", value)
                    }
                  >
                    <SelectTrigger className="w-full text-black">
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem
                          key={driver.driver_id}
                          value={driver.driver_id.toString()}
                        >
                          {driver.full_name} ({driver.availability})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Assign Vehicle
                  </label>
                  <Select
                    value={formData.vehicle_id}
                    onValueChange={(value) =>
                      handleSelectChange("vehicle_id", value)
                    }
                  >
                    <SelectTrigger className="w-full text-black">
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem
                          key={vehicle.vehicle_id}
                          value={vehicle.vehicle_id.toString()}
                        >
                          {vehicle.plate_number} ({vehicle.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <Input
                    type="date"
                    name="schedule_date"
                    value={formData.schedule_date}
                    onChange={handleInputChange}
                    required
                    className="text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Departure Time
                  </label>
                  <Input
                    type="time"
                    name="departure_time"
                    value={formData.departure_time}
                    onChange={handleInputChange}
                    required
                    className="text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Arrival Time
                  </label>
                  <Input
                    type="time"
                    name="arrival_time"
                    value={formData.arrival_time}
                    onChange={handleInputChange}
                    required
                    className="text-black"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="generate_return"
                  checked={formData.generate_return}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label className="text-sm font-medium">
                  Generate Return Trip (auto 30 min rest)
                </label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className={`bg-primary ${buttonBase}`}>
                  {editingId ? "Update Schedule" : "Create Schedule"}
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

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Route
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Driver
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Vehicle
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Departure
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Arrival
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
                {schedules.map((schedule) => (
                  <tr
                    key={schedule.schedule_id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-black">
                      {schedule.schedule_id}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {schedule.route_name || schedule.route_id}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {schedule.driver_name || schedule.driver_id}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {schedule.plate_number || schedule.vehicle_id}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {schedule.schedule_date}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {schedule.departure_time}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {schedule.arrival_time}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <StatusBadge status={schedule.status} />
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(schedule)}
                          className="p-1.5 hover:bg-gray-200 rounded text-primary"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteClick(schedule.schedule_id)
                          }
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
        title="Delete Schedule"
        description="Are you sure you want to delete this schedule? This action cannot be undone."
      />
    </div>
  );
}
