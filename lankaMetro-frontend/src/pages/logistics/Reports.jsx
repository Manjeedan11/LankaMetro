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
  useGetScheduleReportQuery,
  useGetRouteSummaryQuery,
  useExportScheduleReportPDFQuery,
} from "@/lib/api";

export default function Reports() {
  const [dateFrom, setDateFrom] = useState("2024-05-01");
  const [dateTo, setDateTo] = useState("2024-05-26");
  const [routeFilter, setRouteFilter] = useState("all");
  const [triggerExport, setTriggerExport] = useState(false);

  const { data: scheduleData = [], isLoading: scheduleLoading } =
    useGetScheduleReportQuery({
      startDate: dateFrom,
      endDate: dateTo,
    });

  const { data: routeSummary = [], isLoading: summaryLoading } =
    useGetRouteSummaryQuery(30);

  const {
    data: pdfBlob,
    refetch: exportPDF,
    isFetching: pdfLoading,
  } = useExportScheduleReportPDFQuery(
    { startDate: dateFrom, endDate: dateTo },
    { skip: !triggerExport }
  );

  useEffect(() => {
    if (pdfBlob && triggerExport) {
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `schedule_report_${dateFrom}_to_${dateTo}.pdf`;
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

  const totalRoutes = routeSummary.length;
  const totalTrips = scheduleData.length;
  const avgCompletion = scheduleData.length
    ? (scheduleData.filter((s) => s.status === "COMPLETED").length /
        scheduleData.length) *
      100
    : 0;
  const activeVehicles = 9;

  const filteredSchedule =
    routeFilter === "all"
      ? scheduleData
      : scheduleData.filter(
          (item) => item.route_id?.toString() === routeFilter
        );

  const buttonBase =
    "border border-gray-300 text-black hover:bg-red-700 hover:text-white transition-colors";

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <p className="page-description">
          View and generate operational reports
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              <label className="block text-sm font-medium mb-2">Route</label>
              <Select value={routeFilter} onValueChange={setRouteFilter}>
                <SelectTrigger className="w-full text-black">
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Routes</SelectItem>
                  {routeSummary.map((route) => (
                    <SelectItem
                      key={route.route_id}
                      value={route.route_id.toString()}
                    >
                      {route.route_name}
                    </SelectItem>
                  ))}
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
              {pdfLoading ? "Generating..." : "Generate & Export PDF"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">Total Routes</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {totalRoutes}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">Total Trips</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {totalTrips}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">Avg Completion</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {avgCompletion.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">Active Vehicles</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {activeVehicles}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Route Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Route
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Trips
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Completion Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {summaryLoading ? (
                  <tr>
                    <td colSpan="3" className="text-center py-6 text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : (
                  routeSummary.map((route) => {
                    const routeTrips = scheduleData.filter(
                      (s) => s.route_id === route.route_id
                    ).length;
                    const completed = scheduleData.filter(
                      (s) =>
                        s.route_id === route.route_id &&
                        s.status === "COMPLETED"
                    ).length;
                    const completionRate = routeTrips
                      ? ((completed / routeTrips) * 100).toFixed(1)
                      : "0.0";
                    return (
                      <tr
                        key={route.route_id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-sm font-medium text-black">
                          {route.route_name}
                        </td>
                        <td className="py-3 px-4 text-sm text-black">
                          {routeTrips}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            {completionRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
