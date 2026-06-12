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
import DatePicker from "@/components/standalone/DatePicker";

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

      {/* Filter Card - Compact styling (kept) */}
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
            {/* Route */}
            <div className="flex-1 w-20">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Route
              </label>
              <Select value={routeFilter} onValueChange={setRouteFilter}>
                <SelectTrigger className="w-full text-black h-8 text-sm">
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
                {pdfLoading ? "Generating..." : "Generate & Export PDF"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-4 bg-white">
            <p className="text-xs font-medium text-gray-600">Total Routes</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {totalRoutes}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-4 bg-white">
            <p className="text-xs font-medium text-gray-600">Total Trips</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {totalTrips}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-4 bg-white">
            <p className="text-xs font-medium text-gray-600">Avg Completion</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {avgCompletion.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-4 bg-white">
            <p className="text-xs font-medium text-gray-600">Active Vehicles</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {activeVehicles}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Route Performance Table - Normal styling (reverted) */}
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="bg-white">
          <CardTitle className="text-lg font-semibold">
            Route Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-white p-0">
          <div className="overflow-x-auto bg-white">
            <table className="w-full bg-white">
              <thead className="bg-white">
                <tr className="border-b border-gray-200 bg-white">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-white">
                    Route
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-white">
                    Trips
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-white">
                    Completion Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {summaryLoading ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center py-6 text-gray-500 bg-white"
                    >
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
                        className="border-b border-gray-100 hover:bg-gray-50 bg-white"
                      >
                        <td className="py-3 px-4 text-sm font-medium text-black bg-white">
                          {route.route_name}
                        </td>
                        <td className="py-3 px-4 text-sm text-black bg-white">
                          {routeTrips}
                        </td>
                        <td className="py-3 px-4 text-sm bg-white">
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
