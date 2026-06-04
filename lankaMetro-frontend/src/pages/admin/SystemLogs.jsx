import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetSystemLogsQuery } from "@/lib/api";
import StatusBadge from "@/components/standalone/StatusBadge";
import { format } from "date-fns";

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
    setPage(1); // reset to first page on filter change
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

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Date From
              </label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date To</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">User ID</label>
              <Input
                type="number"
                placeholder="User ID"
                value={filters.userId}
                onChange={(e) => handleFilterChange("userId", e.target.value)}
                className="text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Action</label>
              <Input
                type="text"
                placeholder="e.g., Create Depot"
                value={filters.action}
                onChange={(e) => handleFilterChange("action", e.target.value)}
                className="text-black"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6">Loading...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Time
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        User
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Action
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center py-6 text-gray-500"
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
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {format(
                              new Date(log.log_time),
                              "yyyy-MM-dd HH:mm:ss"
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {log.user_name}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {log.action}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {log.details || "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page === pagination.pages}
                    onClick={() => setPage((p) => p + 1)}
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
