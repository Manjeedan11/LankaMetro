import {
  Wrench,
  CheckCircle,
  Clock,
  BusFront,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import StatCard from "@/components/standalone/StatCard";
import StatusBadge from "@/components/standalone/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/standalone/ConfirmDialog";
import DatePicker from "@/components/standalone/DatePicker";
import {
  useGetVehiclesQuery,
  useGetMaintenanceRecordsQuery,
  useCreateMaintenanceMutation,
  useUpdateMaintenanceMutation,
} from "@/lib/api";

// Helper to extract YYYY-MM-DD from any date string (fixes timezone offset issues)
const extractDate = (dateValue) => {
  if (!dateValue) return "";
  try {
    if (typeof dateValue === "string" && dateValue.includes("T")) {
      const date = new Date(dateValue);
      return date.toLocaleDateString("en-CA");
    }
    const match = String(dateValue).match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : "";
  } catch {
    return "";
  }
};

export default function MaintenanceDashboard() {
  const { data: vehicles = [] } = useGetVehiclesQuery();
  const { data: maintenanceRecords = [], refetch } =
    useGetMaintenanceRecordsQuery();
  const [createMaintenance] = useCreateMaintenanceMutation();
  const [updateMaintenance] = useUpdateMaintenanceMutation();

  const [formData, setFormData] = useState({
    vehicle_id: "",
    type: "",
    service_date: "",
    description: "",
    status: "SCHEDULED",
  });

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter((v) => v.status === "ACTIVE").length;
  const inMaintenance = vehicles.filter(
    (v) => v.status === "MAINTENANCE"
  ).length;
  const completedServices = maintenanceRecords.filter(
    (m) => m.status === "COMPLETED"
  ).length;
  const pendingServices = maintenanceRecords.filter(
    (m) =>
      m.status === "PENDING" ||
      m.status === "SCHEDULED" ||
      m.status === "IN_PROGRESS"
  ).length;

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Frontend quick check (optional) – backend will also enforce
  const isDuplicateMaintenance = (vehicleId, serviceDate) => {
    return maintenanceRecords.some(
      (rec) =>
        rec.vehicle_id === parseInt(vehicleId) &&
        rec.service_date === serviceDate &&
        rec.status !== "COMPLETED"
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Quick frontend validation to avoid unnecessary API call
    if (isDuplicateMaintenance(formData.vehicle_id, formData.service_date)) {
      toast.error(
        "A maintenance record already exists for this vehicle on this date (and is not completed).",
        {
          icon: <AlertCircle className="h-4 w-4" />,
          style: { background: "#fee2e2", color: "#b91c1c" },
        }
      );
      return;
    }

    try {
      await createMaintenance(formData).unwrap();
      toast.success("Maintenance record created successfully.", {
        icon: <CheckCircle className="h-4 w-4" />,
        style: { background: "#dcfce7", color: "#166534" },
      });
      refetch();
      setFormData({
        vehicle_id: "",
        type: "",
        service_date: "",
        description: "",
        status: "SCHEDULED",
      });
    } catch (err) {
      console.error("Failed to create maintenance:", err);
      toast.error(err?.data?.message || "Error creating maintenance record", {
        icon: <AlertCircle className="h-4 w-4" />,
        style: { background: "#fee2e2", color: "#b91c1c" },
      });
    }
  };

  const openActionDialog = (id, newStatus, actionLabel) => {
    setPendingAction({ id, newStatus, actionLabel });
    setConfirmDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!pendingAction) return;
    try {
      await updateMaintenance({
        id: pendingAction.id,
        status: pendingAction.newStatus,
      }).unwrap();
      toast.success(
        `Maintenance ${pendingAction.actionLabel.toLowerCase()}ed successfully.`,
        {
          icon: <CheckCircle className="h-4 w-4" />,
          style: { background: "#dcfce7", color: "#166534" },
        }
      );
      refetch();
    } catch (err) {
      toast.error(
        err?.data?.message ||
          `Failed to ${pendingAction.actionLabel.toLowerCase()} maintenance`,
        {
          icon: <AlertCircle className="h-4 w-4" />,
          style: { background: "#fee2e2", color: "#b91c1c" },
        }
      );
    } finally {
      setConfirmDialogOpen(false);
      setPendingAction(null);
    }
  };

  const buttonBase =
    "border border-gray-300 text-black hover:bg-red-700 hover:text-white transition-colors";

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-8">
      <Toaster position="bottom-right" richColors={false} />

      <div className="page-header">
        <h1 className="page-title">Maintenance Dashboard</h1>
        <p className="page-description">Track vehicle maintenance schedules</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="In Maintenance"
          value={inMaintenance}
          icon={Wrench}
          color="primary"
        />
        <StatCard
          title="Completed Services"
          value={completedServices}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Pending Services"
          value={pendingServices}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Active Vehicles"
          value={activeVehicles}
          icon={BusFront}
          color="purple"
        />
      </div>

      {/* Add Maintenance Record Form */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Add Maintenance Record</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Vehicle</label>
              <Select
                value={formData.vehicle_id}
                onValueChange={(value) =>
                  handleSelectChange("vehicle_id", value)
                }
              >
                <SelectTrigger className="w-full bg-white text-black border border-gray-300 rounded-md">
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white border border-gray-200 rounded-md shadow-lg">
                  {vehicles.map((v) => (
                    <SelectItem
                      key={v.vehicle_id}
                      value={v.vehicle_id.toString()}
                      className="text-black hover:bg-gray-100"
                    >
                      {v.plate_number} ({v.vehicle_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Maintenance Type
              </label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange("type", value)}
              >
                <SelectTrigger className="w-full bg-white text-black border border-gray-300 rounded-md">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white border border-gray-200 rounded-md shadow-lg">
                  <SelectItem value="OIL_CHANGE">Oil Change</SelectItem>
                  <SelectItem value="BRAKE_SERVICE">Brake Service</SelectItem>
                  <SelectItem value="ENGINE_REPAIR">Engine Repair</SelectItem>
                  <SelectItem value="INSPECTION">Inspection</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Service Date
              </label>
              <DatePicker
                date={formData.service_date}
                onDateChange={(dateStr) =>
                  setFormData((prev) => ({ ...prev, service_date: dateStr }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger className="w-full bg-white text-black border border-gray-300 rounded-md">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white border border-gray-200 rounded-md shadow-lg">
                  <SelectItem value="SCHEDULED">SCHEDULED</SelectItem>
                  <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Maintenance details..."
                className="text-black bg-white border border-gray-300 rounded-md"
              />
            </div>

            <Button type="submit" className={`w-full bg-primary ${buttonBase}`}>
              Add Record
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Maintenance Table */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Vehicle
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {maintenanceRecords.map((item) => (
                  <tr
                    key={item.maintenance_id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-black">
                      {item.plate_number || item.vehicle_id}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {item.type?.replace(/_/g, " ")}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {extractDate(item.service_date)}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {item.status === "SCHEDULED" && (
                        <button
                          onClick={() =>
                            openActionDialog(
                              item.maintenance_id,
                              "IN_PROGRESS",
                              "Start"
                            )
                          }
                          className="px-3 py-1 text-xs font-medium border border-gray-300 text-black rounded-md hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          Start
                        </button>
                      )}
                      {item.status === "IN_PROGRESS" && (
                        <button
                          onClick={() =>
                            openActionDialog(
                              item.maintenance_id,
                              "COMPLETED",
                              "Complete"
                            )
                          }
                          className="px-3 py-1 text-xs font-medium border border-gray-300 text-black rounded-md hover:bg-red-700 hover:text-white transition-colors"
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={confirmAction}
        title="Confirm Action"
        description={
          pendingAction
            ? `Are you sure you want to ${pendingAction.actionLabel.toLowerCase()} this maintenance?`
            : ""
        }
        confirmText={pendingAction?.actionLabel || "Confirm"}
        cancelText="Cancel"
      />
    </div>
  );
}
