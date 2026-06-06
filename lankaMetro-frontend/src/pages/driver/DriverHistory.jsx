import StatusBadge from "@/components/standalone/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetMyHistoryQuery } from "@/lib/api";

export default function DriverHistory() {  

  const { data: trips = [], isLoading, isError } = useGetMyHistoryQuery();
  const totalTrips = trips.length;
  const completedTrips = trips.filter((t) => t.status === "COMPLETED").length;
  const completionRate = totalTrips ? ((completedTrips / totalTrips) * 100).toFixed(0) : 0;
  
  if (isLoading) return <div className="p-6">Loading your trip history...</div>;
  if (isError) return <div className="p-6 text-red-600">Error loading history.</div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      <div className="page-header">
        <h1 className="page-title">Trip History</h1>
        <p className="page-description">View your completed trips and performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">Total Trips</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalTrips}</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{completedTrips}</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-600">Completion Rate</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{completionRate}%</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Your Trips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Trip ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Route</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vehicle</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {trips.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-gray-500">No trips found.</td>
                  </tr>
                ) : (
                  trips.map((trip) => (
                    <tr key={trip.schedule_id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-black">{trip.schedule_id}</td>
                      <td className="py-3 px-4 text-sm text-black">{trip.route_name || trip.route_id}</td>
                      <td className="py-3 px-4 text-sm text-black">{trip.plate_number || trip.vehicle_id}</td>
                      <td className="py-3 px-4 text-sm text-black">{trip.schedule_date}</td>
                      <td className="py-3 px-4 text-sm">
                        <StatusBadge status={trip.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
