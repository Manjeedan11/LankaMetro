import { MapPin, Users, BusFront, Route } from "lucide-react";
import StatCard from "@/components/standalone/StatCard";

export default function AdminDashboard() {
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
          value="12"
          icon={MapPin}
          color="primary"
          trend={{ type: "up", percentage: 5 }}
        />
        <StatCard
          title="Total Users"
          value="48"
          icon={Users}
          color="blue"
          trend={{ type: "up", percentage: 12 }}
        />
        <StatCard
          title="Active Vehicles"
          value="156"
          icon={BusFront}
          color="green"
          trend={{ type: "down", percentage: 2 }}
        />
        <StatCard
          title="Active Routes"
          value="34"
          icon={Route}
          color="purple"
          trend={{ type: "up", percentage: 8 }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-black">
            Route Map Preview
          </h2>
          <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center text-gray-500">
            Route visualization map would be displayed here
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-black">
            Depot Overview
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm font-medium">Colombo Central</p>
              <p className="text-xs text-gray-600">45 active routes</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm font-medium">Kandy Transport Hub</p>
              <p className="text-xs text-gray-600">32 active routes</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm font-medium">Galle Depot</p>
              <p className="text-xs text-gray-600">28 active routes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-black">
          Recent Activities
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  User
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Action
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm">John Doe</td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  Created new depot
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">2 hours ago</td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm">Jane Smith</td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  Updated vehicle status
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">4 hours ago</td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm">Admin</td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  System backup completed
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">6 hours ago</td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm">Mike Brown</td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  Added new driver
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">1 day ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
