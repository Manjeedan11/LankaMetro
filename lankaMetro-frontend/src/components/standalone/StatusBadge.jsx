export default function StatusBadge({ status }) {
  const statusStyles = {
    ACTIVE: "bg-green-100 text-green-800",
    INACTIVE: "bg-gray-100 text-gray-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    MAINTENANCE: "bg-blue-100 text-blue-800",
    RETIRED: "bg-red-100 text-red-800",
    SCHEDULED: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    AVAILABLE: "bg-green-100 text-green-800",
    UNAVAILABLE: "bg-gray-100 text-gray-800",
  };

  const style = statusStyles[status] || "bg-gray-100 text-gray-800";

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${style}`}
    >
      {status}
    </span>
  );
}
