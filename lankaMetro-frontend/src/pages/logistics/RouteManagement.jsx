import { Plus, Edit2, Trash2, MapPin } from "lucide-react";
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
import RouteMapPreview from "@/components/standalone/RouteMapPreview";
import {
  useGetRoutesQuery,
  useCreateRouteMutation,
  useUpdateRouteMutation,
  useDeleteRouteMutation,
  useGetStopsQuery,
  useGetRouteStopsQuery,
  useAddStopToRouteMutation,
  useRemoveStopFromRouteMutation,
} from "@/lib/api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function RouteManagement() {
  const {
    data: routes = [],
    isLoading,
    isError,
    refetch,
  } = useGetRoutesQuery();
  const { data: allStops = [] } = useGetStopsQuery();
  const [createRoute] = useCreateRouteMutation();
  const [updateRoute] = useUpdateRouteMutation();
  const [deleteRoute] = useDeleteRouteMutation();
  const [addStopToRoute] = useAddStopToRouteMutation();
  const [removeStopFromRoute] = useRemoveStopFromRouteMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [mapRouteId, setMapRouteId] = useState(null);
  const [formData, setFormData] = useState({
    route_no: "",
    route_name: "",
    start_point: "",
    destination: "",
    distance_txt: "",
    subroute_info: "",
    availability: "ACTIVE",
  });
  const [routeStops, setRouteStops] = useState([]);
  const { data: existingStops = [] } = useGetRouteStopsQuery(editingId, {
    skip: !editingId,
  });

  useEffect(() => {
    if (editingId && existingStops.length) {
      const mapped = existingStops.map((stop) => ({
        stop_id: stop.stop_id,
        stop_order: stop.stop_order,
        stop_name: stop.stop_name,
      }));
      setRouteStops(mapped);
    }
  }, [existingStops, editingId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvailabilityChange = (value) => {
    setFormData((prev) => ({ ...prev, availability: value }));
  };

  const handleAddStopRow = () => {
    const newOrder = routeStops.length + 1;
    setRouteStops([
      ...routeStops,
      { stop_id: "", stop_order: newOrder, stop_name: "" },
    ]);
  };

  const handleStopSelect = (index, stopId) => {
    const selectedStop = allStops.find((s) => s.stop_id === parseInt(stopId));
    const newStops = [...routeStops];
    newStops[index] = {
      stop_id: parseInt(stopId),
      stop_order: newStops[index].stop_order,
      stop_name: selectedStop?.stop_name || "",
    };
    setRouteStops(newStops);
  };

  const handleRemoveStopRow = (index) => {
    const newStops = routeStops.filter((_, i) => i !== index);
    const reordered = newStops.map((stop, idx) => ({
      ...stop,
      stop_order: idx + 1,
    }));
    setRouteStops(reordered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let routeId = editingId;
      if (editingId) {
        await updateRoute({ id: editingId, ...formData }).unwrap();
        routeId = editingId;
      } else {
        const res = await createRoute(formData).unwrap();
        routeId = res.route_id;
      }
      if (editingId && existingStops.length) {
        for (const stop of existingStops) {
          await removeStopFromRoute({
            routeId: editingId,
            stopOrder: stop.stop_order,
          }).unwrap();
        }
      }

      for (const stop of routeStops) {
        if (stop.stop_id) {
          await addStopToRoute({
            routeId: routeId,
            stopId: stop.stop_id,
            stopOrder: stop.stop_order,
          }).unwrap();
        }
      }
      refetch();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        route_no: "",
        route_name: "",
        start_point: "",
        destination: "",
        distance_txt: "",
        subroute_info: "",
        availability: "ACTIVE",
      });
      setRouteStops([]);
    } catch (err) {
      console.error("Failed to save route:", err);
      alert("Error saving route");
    }
  };

  const handleEdit = (route) => {
    setFormData({
      route_no: route.route_no,
      route_name: route.route_name,
      start_point: route.start_point,
      destination: route.destination,
      distance_txt: route.distance_txt,
      subroute_info: route.subroute_info || "",
      availability: route.availability,
    });
    setEditingId(route.route_id);
    setShowForm(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteRoute(deleteTargetId).unwrap();
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

  if (isLoading) return <div>Loading routes...</div>;
  if (isError) return <div>Error loading routes</div>;

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
                route_no: "",
                route_name: "",
                start_point: "",
                destination: "",
                distance_txt: "",
                subroute_info: "",
                availability: "ACTIVE",
              });
              setRouteStops([]);
              setShowForm(!showForm);
            }}
            className={`mb-6 bg-primary ${buttonBase}`}
          >
            <Plus size={20} />
            Add Route
          </Button>

          {showForm && (
            <Card className="mb-6 border border-gray-200 shadow-sm overflow-visible">
              <CardHeader>
                <CardTitle>
                  {editingId ? "Edit Route" : "Create New Route"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Route Number
                    </label>
                    <Input
                      type="text"
                      name="route_no"
                      value={formData.route_no}
                      onChange={handleInputChange}
                      placeholder="e.g., R101"
                      required
                      className="text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Route Name
                    </label>
                    <Input
                      type="text"
                      name="route_name"
                      value={formData.route_name}
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
                        name="start_point"
                        value={formData.start_point}
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
                    <label className="block text-sm font-medium mb-2">
                      Distance
                    </label>
                    <Input
                      type="text"
                      name="distance_txt"
                      value={formData.distance_txt}
                      onChange={handleInputChange}
                      placeholder="e.g., 115 km"
                      required
                      className="text-black"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium">
                        Route Stops (in order)
                      </label>
                      <Button
                        type="button"
                        variant="link"
                        onClick={handleAddStopRow}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        + Add Stop
                      </Button>
                    </div>
                    {routeStops.length === 0 && (
                      <p className="text-sm text-gray-500">
                        No stops added. Click "Add Stop" to select stops.
                      </p>
                    )}
                    <div className="space-y-2">
                      {routeStops.map((stop, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <span className="text-sm font-medium w-8">
                            {stop.stop_order}.
                          </span>
                          <Select
                            value={stop.stop_id.toString()}
                            onValueChange={(value) =>
                              handleStopSelect(index, value)
                            }
                          >
                            <SelectTrigger className="flex-1 bg-white">
                              <SelectValue placeholder="Select a stop" />
                            </SelectTrigger>
                            <SelectContent className="z-50 bg-white border border-gray-200 rounded-md shadow-lg">
                              {allStops.map((s) => (
                                <SelectItem
                                  key={s.stop_id}
                                  value={s.stop_id.toString()}
                                  className="text-black hover:bg-gray-100"
                                >
                                  {s.stop_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveStopRow(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Sub Routes
                    </label>
                    <Input
                      type="text"
                      name="subroute_info"
                      value={formData.subroute_info}
                      onChange={handleInputChange}
                      placeholder="e.g., Route A, Route B"
                      className="text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Availability
                    </label>
                    <Select
                      onValueChange={handleAvailabilityChange}
                      value={formData.availability}
                    >
                      <SelectTrigger className="w-full text-black">
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-white border border-gray-200 rounded-md shadow-lg">
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
                    Route No
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
                    Sub Routes
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Availability
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
                    key={route.route_id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-black">
                      {route.route_id}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {route.route_no}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {route.route_name}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {route.start_point}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {route.destination}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {route.subroute_info ? (
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem
                            value="subroute-info"
                            className="border-0"
                          >
                            <AccordionTrigger className="py-1 text-sm hover:no-underline">
                              <span className="truncate max-w-[200px] text-left">
                                {route.subroute_info.length > 50
                                  ? route.subroute_info.substring(0, 50) + "..."
                                  : route.subroute_info}
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="text-sm text-gray-600 pb-1">
                              {route.subroute_info}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <StatusBadge status={route.availability} />
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <button
                        onClick={() => setMapRouteId(route.route_id)}
                        className="p-1.5 hover:bg-gray-200 rounded text-blue-600"
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
                          onClick={() => handleDeleteClick(route.route_id)}
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
        title="Delete Route"
        description="Are you sure you want to delete this route? This action cannot be undone."
      />

      {mapRouteId && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setMapRouteId(null)}
        >
          <div
            className="bg-white rounded-lg p-4 max-w-3xl w-full m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Route Map Preview</h3>
              <button
                onClick={() => setMapRouteId(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <RouteMapPreview routeId={mapRouteId} />
          </div>
        </div>
      )}
    </div>
  );
}
