import { Play, CheckCircle, AlertCircle } from "lucide-react";
import StatusBadge from "@/components/standalone/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useGetMySchedulesQuery,
  useUpdateScheduleStatusMutation,
  useGetNotificationsQuery,
} from "@/lib/api";
import { toast } from "sonner";

export default function DriverTrips() {
  const {
    data: schedules = [],
    isLoading,
    refetch: refetchSchedules,
  } = useGetMySchedulesQuery();
  const [updateScheduleStatus] = useUpdateScheduleStatusMutation();
  const { data: notifications = [] } = useGetNotificationsQuery();

  const handleStartTrip = async (scheduleId) => {
    try {
      await updateScheduleStatus({
        id: scheduleId,
        status: "IN_PROGRESS",
      }).unwrap();
      toast.success("Trip started. Driver is now ON DUTY.", {
        icon: "🚌",
        style: { background: "#dcfce7", color: "#166534" },
      });
      refetchSchedules();
    } catch (err) {
      toast.error("Failed to start trip.", {
        icon: "❌",
        style: { background: "#fee2e2", color: "#b91c1c" },
      });
    }
  };

  const handleCompleteTrip = async (scheduleId) => {
    try {
      await updateScheduleStatus({
        id: scheduleId,
        status: "COMPLETED",
      }).unwrap();
      toast.success("Trip completed.", {
        icon: "✅",
        style: { background: "#dcfce7", color: "#166534" },
      });
      refetchSchedules();
    } catch (err) {
      toast.error("Failed to complete trip.", {
        icon: "❌",
        style: { background: "#fee2e2", color: "#b91c1c" },
      });
    }
  };

  const buttonBase =
    "border border-gray-300 text-black hover:bg-red-700 hover:text-white transition-colors";

  if (isLoading) return <div className="p-6">Loading your trips...</div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
      <div className="page-header">
        <h1 className="page-title">My Trips</h1>
        <p className="page-description">View your scheduled and active trips</p>
      </div>

      <div className="space-y-6">
        {/* Render all trips (forward and return) */}
        {schedules.map((trip, index) => (
          <Card
            key={trip.schedule_id}
            className="border border-gray-200 shadow-sm"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {index === 0 && schedules.length > 1
                  ? "Forward Trip"
                  : index === 1 && schedules.length > 1
                  ? "Return Trip"
                  : `Trip ${index + 1}`}
              </CardTitle>
              <StatusBadge status={trip.status} />
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Trip ID</span>
                  <span className="text-sm font-medium text-black">
                    {trip.schedule_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Route</span>
                  <span className="text-sm font-medium text-black">
                    {trip.route_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Vehicle</span>
                  <span className="text-sm font-medium text-black">
                    {trip.plate_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Departure</span>
                  <span className="text-sm font-medium text-black">
                    {trip.departure_time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Arrival</span>
                  <span className="text-sm font-medium text-black">
                    {trip.arrival_time}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                {trip.status === "SCHEDULED" && (
                  <Button
                    className={`flex-1 bg-primary ${buttonBase}`}
                    onClick={() => handleStartTrip(trip.schedule_id)}
                  >
                    <Play size={16} className="mr-2" />
                    Start Trip
                  </Button>
                )}
                {trip.status === "IN_PROGRESS" && (
                  <Button
                    className={`flex-1 bg-primary ${buttonBase}`}
                    onClick={() => handleCompleteTrip(trip.schedule_id)}
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Complete Trip
                  </Button>
                )}
                {trip.status === "COMPLETED" && (
                  <Button variant="outline" className={buttonBase} disabled>
                    Completed
                  </Button>
                )}
                <Button variant="outline" className={buttonBase}>
                  View Route
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Notifications Card */}
        <Card className="border border-blue-200 shadow-sm border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="text-blue-600" size={20} />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500">No new notifications.</p>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.notification_id}
                    className="p-3 bg-blue-50 rounded text-sm text-blue-900"
                  >
                    • {notif.message}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
