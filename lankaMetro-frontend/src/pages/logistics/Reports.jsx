import { Download, Filter } from "lucide-react";
import { useState } from "react";
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

const mockReports = [
  {
    route: "R001 - Colombo Express",
    trips: 24,
    vehicles: 3,
    drivers: 4,
    completionRate: "98%",
  },
  {
    route: "R002 - Kandy Loop",
    trips: 18,
    vehicles: 2,
    drivers: 3,
    completionRate: "95%",
  },
  {
    route: "R003 - Galle Connector",
    trips: 15,
    vehicles: 2,
    drivers: 2,
    completionRate: "100%",
  },
  {
    route: "R004 - Jaffna Express",
    trips: 12,
    vehicles: 2,
    drivers: 2,
    completionRate: "92%",
  },
];

export default function Reports() {
  const [dateFrom, setDateFrom] = useState("2024-05-01");
  const [dateTo, setDateTo] = useState("2024-05-26");
  const [depot, setDepot] = useState("all");
  const [route, setRoute] = useState("all");

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
              <label className="block text-sm font-medium mb-2">Depot</label>
              <Select value={depot} onValueChange={setDepot}>
                <SelectTrigger className="w-full text-black">
                  <SelectValue placeholder="Select depot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Depots</SelectItem>
                  <SelectItem value="colombo">Colombo Central</SelectItem>
                  <SelectItem value="kandy">Kandy Hub</SelectItem>
                  <SelectItem value="galle">Galle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Route</label>
              <Select value={route} onValueChange={setRoute}>
                <SelectTrigger className="w-full text-black">
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Routes</SelectItem>
                  <SelectItem value="r001">R001 - Colombo Express</SelectItem>
                  <SelectItem value="r002">R002 - Kandy Loop</SelectItem>
                  <SelectItem value="r003">R003 - Galle Connector</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className={buttonBase}>
              <Download size={16} className="mr-2" />
              Generate & Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">Total Routes</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">4</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">Total Trips</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">69</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">Avg Completion</p>
            <p className="text-2xl font-bold text-green-600 mt-1">96.25%</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">Active Vehicles</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">9</p>
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
                    Vehicles
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Drivers
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Completion Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockReports.map((report, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-black">
                      {report.route}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {report.trips}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {report.vehicles}
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      {report.drivers}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        {report.completionRate}
                      </span>
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
