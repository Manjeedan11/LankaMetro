import { MapPin, Users, BusFront, Route } from "lucide-react";
import StatCard from "@/components/standalone/StatCard";
import DepotMap from "@/components/standalone/DepotMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGetDepotsQuery,
  useGetUsersQuery,
  useGetVehiclesQuery,
  useGetRoutesQuery,
} from "@/lib/api";

export default function AdminDashboard() {
  const { data: depots = [] } = useGetDepotsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const { data: vehicles = [] } = useGetVehiclesQuery();
  const { data: routes = [] } = useGetRoutesQuery();

  const totalDepots = depots.length;
  const totalUsers = users.length;
  const activeVehicles = vehicles.filter((v) => v.status === "ACTIVE").length;
  const activeRoutes = routes.filter((r) => r.availability === "ACTIVE").length;

  const depotTrend = { type: "up", percentage: 5 };
  const userTrend = { type: "up", percentage: 12 };
  const vehicleTrend = { type: "down", percentage: 2 };
  const routeTrend = { type: "up", percentage: 8 };

  return (
    <div className="space-y-8 container mx-auto px-4 py-6 max-w-7xl">
      <div className="page-header">
        <h1 className="page-title text-black">Welcome back, Administrator</h1>
        <p className="page-description">
          Manage your transport depot operations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Depots"
          value={totalDepots}
          icon={MapPin}
          color="primary"
          trend={depotTrend}
        />
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          color="blue"
          trend={userTrend}
        />
        <StatCard
          title="Active Vehicles"
          value={activeVehicles}
          icon={BusFront}
          color="green"
          trend={vehicleTrend}
        />
        <StatCard
          title="Active Routes"
          value={activeRoutes}
          icon={Route}
          color="purple"
          trend={routeTrend}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Depot Map Card */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-black">
            Depot Locations
          </h2>
          <DepotMap />
        </div>

        {/* Depot Overview Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-black">
            Depot Overview
          </h2>
          <div className="space-y-3">
            {depots.slice(0, 3).map((depot) => (
              <div key={depot.depot_id} className="p-3 bg-gray-50 rounded">
                <p className="text-sm font-medium">{depot.depot_name}</p>
                <p className="text-xs text-gray-600">
                  {depot.latitude && depot.longitude
                    ? "📍 Located"
                    : "⚠️ No coordinates"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
