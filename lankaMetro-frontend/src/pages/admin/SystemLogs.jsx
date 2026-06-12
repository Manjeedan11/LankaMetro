import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetSystemLogsQuery } from "@/lib/api";
import { format } from "date-fns";
import DatePicker from "@/components/standalone/DatePicker";

export default function SystemLogs() {
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    userId: "",
    action: "",
  });

  const { data, isLoading, isError } = useGetSystemLogsQuery({
    page,
    limit,
    ...filters,
  });

  const logs = data?.logs || [];
  const pagination = data?.pagination || { total: 0, pages: 1 };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ startDate: "", endDate: "", userId: "", action: "" });
    setPage(1);
  };

  if (isError)
    return <div className="p-6 text-red-600">Error loading system logs.</div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      <div className="page-header">
        <h1 className="page-title">System Logs</h1>
        <p className="page-description">Audit log of all system activities</p>
      </div>

      {/* COMPACT FILTER CARD */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            {/* Date From - fixed narrower width */}
            <div className="w-30">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Date From
              </label>
              <DatePicker
                date={filters.startDate}
                onDateChange={(dateStr) =>
                  handleFilterChange("startDate", dateStr)
                }
              />
            </div>
            {/* Date To - fixed narrower width */}
            <div className="w-30">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Date To
              </label>
              <DatePicker
                date={filters.endDate}
                onDateChange={(dateStr) =>
                  handleFilterChange("endDate", dateStr)
                }
              />
            </div>
            {/* User ID - flexible, left-aligned */}
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                User ID
              </label>
              <Input
                type="number"
                placeholder="User ID"
                value={filters.userId}
                onChange={(e) => handleFilterChange("userId", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            {/* Action - flexible, left-aligned */}
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Action
              </label>
              <Input
                type="text"
                placeholder="e.g., Create Depot"
                value={filters.action}
                onChange={(e) => handleFilterChange("action", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            {/* Clear button - stays on right */}
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-xs whitespace-nowrap rounded-md"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table – unchanged */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6">Loading...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">
                        Time
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">
                        User
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">
                        Action
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center py-6 text-gray-500 text-sm"
                        >
                          No logs found.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr
                          key={log.log_id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-2 px-3 text-xs text-gray-500">
                            {format(
                              new Date(log.log_time),
                              "yyyy-MM-dd HH:mm:ss"
                            )}
                          </td>
                          <td className="py-2 px-3 text-xs text-gray-900">
                            {log.user_name}
                          </td>
                          <td className="py-2 px-3 text-xs text-gray-900">
                            {log.action}
                          </td>
                          <td className="py-2 px-3 text-xs text-gray-600">
                            {log.details || "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {pagination.pages > 1 && (
                <div className="flex justify-end items-center gap-4 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="h-8 text-xs"
                  >
                    Previous
                  </Button>
                  <span className="text-xs text-gray-600">
                    Page {page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === pagination.pages}
                    onClick={() => setPage((p) => p + 1)}
                    className="h-8 text-xs"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
