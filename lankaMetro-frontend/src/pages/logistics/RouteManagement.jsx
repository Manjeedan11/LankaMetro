import { Plus, Edit2, Trash2, MapPin } from "lucide-react";
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

const mockRoutes = [
  {
    id: "R001",
    name: "Colombo Express",
    start: "Colombo",
    destination: "Kandy",
    stops: 5,
    status: "ACTIVE",
  },
  {
    id: "R002",
    name: "Kandy Loop",
    start: "Kandy",
    destination: "Galle",
    stops: 8,
    status: "ACTIVE",
  },
  {
    id: "R003",
    name: "Galle Connector",
    start: "Galle",
    destination: "Matara",
    stops: 3,
    status: "ACTIVE",
  },
];

export default function RouteManagement() {
  const [routes, setRoutes] = useState(mockRoutes);
  const [showForm, setShowForm] = useState(false);
  const [stops, setStops] = useState(["", ""]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    start: "",
    destination: "",
    subRoutes: "",
    status: "ACTIVE",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleAddStop = () => {
    setStops([...stops, ""]);
  };

  const handleStopChange = (index, value) => {
    const newStops = [...stops];
    newStops[index] = value;
    setStops(newStops);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setRoutes(
        routes.map((r) =>
          r.id === editingId
            ? { ...r, ...formData, stops: stops.filter((s) => s).length }
            : r
        )
      );
      setEditingId(null);
    } else {
      const newRoute = {
        id: `R${String(routes.length + 1).padStart(3, "0")}`,
        ...formData,
        stops: stops.filter((s) => s).length,
      };
      setRoutes([...routes, newRoute]);
    }
    setFormData({
      name: "",
      start: "",
      destination: "",
      subRoutes: "",
      status: "ACTIVE",
    });
    setStops(["", ""]);
    setShowForm(false);
  };

  const handleEdit = (route) => {
    setFormData(route);
    setEditingId(route.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setRoutes(routes.filter((r) => r.id !== id));
  };

  const buttonBase =
    "border border-gray-300 text-black hover:bg-red-700 hover:text-white transition-colors";

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      <div className="page-header">
        <h1 className="page-title">Route Management</h1>
        <p className="page-description">Create and manage transport routes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Button
            onClick={() => {
              setEditingId(null);
              setFormData({
                name: "",
                start: "",
                destination: "",
                subRoutes: "",
                status: "ACTIVE",
              });
              setStops(["", ""]);
              setShowForm(!showForm);
            }}
            className={`mb-6 bg-primary ${buttonBase}`}
          >
            <Plus size={20} />
            Add Route
          </Button>

          {showForm && (
            <Card className="mb-6 border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle>
                  {editingId ? "Edit Route" : "Create New Route"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Route Name
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter route name"
                      required
                      className="text-black"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Start Point
                      </label>
                      <Input
                        type="text"
                        name="start"
                        value={formData.start}
                        onChange={handleInputChange}
                        placeholder="Start point"
                        required
                        className="text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        End Point
                      </label>
                      <Input
                        type="text"
                        name="destination"
                        value={formData.destination}
                        onChange={handleInputChange}
                        placeholder="Destination"
                        required
                        className="text-black"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium">Stops</label>
                      <Button
                        type="button"
                        variant="link"
                        onClick={handleAddStop}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        + Add Stop
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {stops.map((stop, index) => (
                        <Input
                          key={index}
                          type="text"
                          value={stop}
                          onChange={(e) =>
                            handleStopChange(index, e.target.value)
                          }
                          placeholder={`Stop ${index + 1}`}
                          className="text-black"
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Sub Routes
                    </label>
                    <Input
                      type="text"
                      name="subRoutes"
                      value={formData.subRoutes}
                      onChange={handleInputChange}
                      placeholder="e.g., Route A, Route B"
                      className="text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Status
                    </label>
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
                    <Button
                      type="submit"
                      className={`bg-primary ${buttonBase}`}
                    >
                      {editingId ? "Update Route" : "Save Route"}
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
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle>Route Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center text-gray-500">
              <MapPin size={48} className="text-gray-300" />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Map preview will be displayed here
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>All Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Route ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Route Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Start
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Destination
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Stops
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Map Preview
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => (
                  <tr
                    key={route.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-black">
                      {route.id}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {route.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {route.start}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {route.destination}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {route.stops}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <StatusBadge status={route.status} />
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <button
                        onClick={() => {}}
                        className="p-1.5 hover:bg-gray-200 rounded pl-9 text-blue-600"
                        title="Preview Route on Map"
                      >
                        <MapPin size={16} />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(route)}
                          className="p-1.5 hover:bg-gray-200 rounded text-primary"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(route.id)}
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
