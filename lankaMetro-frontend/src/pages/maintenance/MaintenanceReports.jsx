import { Download, Filter } from "lucide-react";
import { useState, useEffect } from "react";
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
import {
  useGetMaintenanceReportQuery,
  useGetVehiclesQuery,
  useExportMaintenanceReportPDFQuery,
} from "@/lib/api";
import DatePicker from "@/components/standalone/DatePicker";
import StatusBadge from "@/components/standalone/StatusBadge";

export default function MaintenanceReports() {
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [triggerExport, setTriggerExport] = useState(false);

  const {
    data: maintenanceRecords = [],
    isLoading,
    isError,
    refetch,
  } = useGetMaintenanceReportQuery({
    startDate: dateFrom,
    endDate: dateTo,
    vehicleId: vehicleFilter !== "all" ? vehicleFilter : undefined,
  });
  const { data: vehicles = [] } = useGetVehiclesQuery();

  const {
    data: pdfBlob,
    refetch: exportPDF,
    isFetching: pdfLoading,
  } = useExportMaintenanceReportPDFQuery(
    {
      startDate: dateFrom,
      endDate: dateTo,
      vehicleId: vehicleFilter !== "all" ? vehicleFilter : undefined,
    },
    { skip: !triggerExport }
  );

  useEffect(() => {
    if (pdfBlob && triggerExport) {
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `maintenance_report_${dateFrom}_to_${dateTo}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setTriggerExport(false);
    }
  }, [pdfBlob, triggerExport, dateFrom, dateTo]);

  const handleExportPDF = () => {
    setTriggerExport(true);
    exportPDF();
  };

  // Filter by status client‑side
  const filteredRecords =
    statusFilter === "all"
      ? maintenanceRecords
      : maintenanceRecords.filter((record) => record.status === statusFilter);

  const totalRecords = filteredRecords.length;
  const completedCount = filteredRecords.filter(
    (r) => r.status === "COMPLETED"
  ).length;
  const inProgressCount = filteredRecords.filter(
    (r) => r.status === "IN_PROGRESS"
  ).length;
  const pendingCount = filteredRecords.filter(
    (r) => r.status === "SCHEDULED" || r.status === "PENDING"
  ).length;

  const buttonBase =
    "border border-gray-300 text-black hover:bg-red-700 hover:text-white transition-colors";

  if (isError)
    return (
      <div className="p-6 text-red-600">Error loading maintenance reports.</div>
    );

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      <div className="page-header">
        <h1 className="page-title">Maintenance Reports</h1>
        <p className="page-description">
          View and generate maintenance activity reports
        </p>
      </div>

      {/* Filter Card – compact flex layout (matching Reports.jsx) */}
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="bg-white pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Filter size={18} />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          <div className="flex flex-wrap items-end gap-3">
            {/* Date From */}
            <div className="w-30">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Date From
              </label>
              <DatePicker
                date={dateFrom}
                onDateChange={(dateStr) => setDateFrom(dateStr)}
              />
            </div>
            {/* Date To */}
            <div className="w-30">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Date To
              </label>
              <DatePicker
                date={dateTo}
                onDateChange={(dateStr) => setDateTo(dateStr)}
              />
            </div>
            {/* Vehicle */}
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Vehicle
              </label>
              <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                <SelectTrigger className="w-full bg-white text-black h-8 text-sm">
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white border border-gray-200 rounded-md shadow-lg">
                  <SelectItem
                    value="all"
                    className="text-black hover:bg-gray-100"
                  >
                    All Vehicles
                  </SelectItem>
                  {vehicles.map((v) => (
                    <SelectItem
                      key={v.vehicle_id}
                      value={v.vehicle_id.toString()}
                      className="text-black hover:bg-gray-100"
                    >
                      {v.plate_number} (ID: {v.vehicle_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Status */}
            <div className="w-40">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full bg-white text-black h-8 text-sm">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white border border-gray-200 rounded-md shadow-lg">
                  <SelectItem
                    value="all"
                    className="text-black hover:bg-gray-100"
                  >
                    All Statuses
                  </SelectItem>
                  <SelectItem
                    value="SCHEDULED"
                    className="text-black hover:bg-gray-100"
                  >
                    SCHEDULED
                  </SelectItem>
                  <SelectItem
                    value="IN_PROGRESS"
                    className="text-black hover:bg-gray-100"
                  >
                    IN_PROGRESS
                  </SelectItem>
                  <SelectItem
                    value="COMPLETED"
                    className="text-black hover:bg-gray-100"
                  >
                    COMPLETED
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Export Button */}
            <div>
              <Button
                variant="outline"
                size="sm"
                className={`h-8 text-sm ${buttonBase} rounded-md`}
                onClick={handleExportPDF}
                disabled={pdfLoading}
              >
                <Download size={14} className="mr-2" />
                {pdfLoading ? "Generating..." : "Export PDF"}
              </Button>
            </div>
            {/* Refresh Button */}
            <div>
              <Button
                variant="outline"
                size="sm"
                className={`h-8 text-sm ${buttonBase} rounded-md`}
                onClick={() => refetch()}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
