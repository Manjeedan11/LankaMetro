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

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Filter size={20} />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Date From
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date To</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Vehicle</label>
              <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                <SelectTrigger className="w-full text-black">
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vehicles</SelectItem>
                  {vehicles.map((v) => (
                    <SelectItem
                      key={v.vehicle_id}
                      value={v.vehicle_id.toString()}
                    >
                      {v.plate_number} (ID: {v.vehicle_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full text-black">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="SCHEDULED">SCHEDULED</SelectItem>
                  <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className={buttonBase}
              onClick={handleExportPDF}
              disabled={pdfLoading}
            >
              <Download size={16} className="mr-2" />
              {pdfLoading ? "Generating..." : "Export PDF"}
            </Button>
            <Button
              variant="outline"
              className={buttonBase}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
