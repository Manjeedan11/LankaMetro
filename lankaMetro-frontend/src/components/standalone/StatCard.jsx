export default function StatCard({
  title,
  value,
  icon: Icon,
  color = "primary",
  trend,
}) {
  const bgColors = {
    primary: "bg-red-50 text-red-600",
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
          {trend && (
            <p
              className={`mt-2 text-xs font-medium ${
                trend.type === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.type === "up" ? "↑" : "↓"} {trend.percentage}% from last
              month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${bgColors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
