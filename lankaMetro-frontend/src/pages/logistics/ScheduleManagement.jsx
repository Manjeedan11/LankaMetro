import { Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const mockSchedules = [
  {
    id: "S001",
    route: "R001",
    driver: "John Doe",
    vehicle: "V001",
    departure: "08:00",
    arrival: "11:00",
    date: "2024-05-26",
    status: "SCHEDULED",
  },
  {
    id: "S002",
    route: "R002",
    driver: "Jane Smith",
    vehicle: "V002",
    departure: "09:30",
    arrival: "02:00",
    date: "2024-05-26",
    status: "IN_PROGRESS",
  },
  {
    id: "S003",
    route: "R001",
    driver: "Mike Brown",
    vehicle: "V003",
    departure: "02:00",
    arrival: "05:00",
    date: "2024-05-26",
    status: "SCHEDULED",
  },
];

const mockAlerts = [
  "Route conflict detected for Route R001",
  "Driver Jane Smith unavailable tomorrow",
  "Vehicle V002 maintenance due in 2 days",
];

export default function ScheduleManagement() {
  const [schedules, setSchedules] = useState(mockSchedules);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    route: "",
    driver: "",
    vehicle: "",
    departure: "",
    arrival: "",
    date: "",
    returnTrip: false,
    status: "SCHEDULED",
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setSchedules(
        schedules.map((s) => (s.id === editingId ? { ...s, ...formData } : s))
      );
      setEditingId(null);
    } else {
      const newSchedule = {
        id: `S${String(schedules.length + 1).padStart(3, "0")}`,
        ...formData,
      };
      setSchedules([...schedules, newSchedule]);
    }
    setFormData({
      route: "",
      driver: "",
      vehicle: "",
      departure: "",
      arrival: "",
      date: "",
      returnTrip: false,
      status: "SCHEDULED",
    });
    setShowForm(false);
  };

  const handleEdit = (schedule) => {
    setFormData(schedule);
    setEditingId(schedule.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setSchedules(schedules.filter((s) => s.id !== id));
  };

  const buttonBase =
    "border border-gray-300 text-black hover:bg-red-700 hover:text-white transition-colors";

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      <div className="page-header">
        <h1 className="page-title">Schedule Management</h1>
        <p className="page-description">Create and manage trip schedules</p>
      </div>

      {mockAlerts.length > 0 && (
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
                  {mockAlerts.map((alert, idx) => (
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
            route: "",
            driver: "",
            vehicle: "",
            departure: "",
            arrival: "",
            date: "",
            returnTrip: false,
            status: "SCHEDULED",
          });
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
                    value={formData.route}
                    onValueChange={(value) =>
                      handleSelectChange("route", value)
                    }
                  >
                    <SelectTrigger className="w-full text-black">
                      <SelectValue placeholder="Select route" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="R001">
                        R001 - Colombo Express
                      </SelectItem>
                      <SelectItem value="R002">R002 - Kandy Loop</SelectItem>
                      <SelectItem value="R003">
                        R003 - Galle Connector
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Assign Driver
                  </label>
                  <Select
                    value={formData.driver}
                    onValueChange={(value) =>
                      handleSelectChange("driver", value)
                    }
                  >
                    <SelectTrigger className="w-full text-black">
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="John Doe">John Doe</SelectItem>
                      <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                      <SelectItem value="Mike Brown">Mike Brown</SelectItem>
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
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <Input
                    type="date"
                    name="date"
                    value={formData.date}
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
                    name="departure"
                    value={formData.departure}
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
                    name="arrival"
                    value={formData.arrival}
                    onChange={handleInputChange}
                    required
                    className="text-black"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="returnTrip"
                  checked={formData.returnTrip}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label className="text-sm font-medium">
                  Generate Return Trip
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
                    Schedule ID
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
                    key={schedule.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-black">
                      {schedule.id}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {schedule.route}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {schedule.driver}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {schedule.vehicle}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {schedule.departure}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {schedule.arrival}
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
                          onClick={() => handleDelete(schedule.id)}
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
    </div>
  );
}
