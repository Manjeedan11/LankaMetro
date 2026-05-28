import { Bus } from "lucide-react";

export default function StatCard() {
  const title = "Total Vehicles";
  const value = "24";
  const Icon = Bus;
  const color = "primary";
  const trend = { type: "up", percentage: "12" };

  const bgColors = {
    primary: "bg-red-50 text-primary",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          <p
            className={`mt-2 text-xs font-medium ${
              trend.type === "up" ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.type === "up" ? "↑" : "↓"} {trend.percentage}% from last
            month
          </p>
        </div>
        <div className={`p-3 rounded-lg ${bgColors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
