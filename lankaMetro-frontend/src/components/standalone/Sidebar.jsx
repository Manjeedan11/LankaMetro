import { NavLink, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { logout } from "@/lib/features/authSlice";
import {
  LayoutDashboard,
  MapPin,
  Users,
  BusFront,
  FileText,
  Settings,
  LogOut,
  Route,
  CalendarDays,
  Wrench,
  TrendingUp,
  List,
  X,
} from "lucide-react";

const menuItems = {
  admin: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    { icon: MapPin, label: "Depots", path: "/admin/depots" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: BusFront, label: "Vehicles", path: "/admin/vehicles" },
    { icon: FileText, label: "System Logs", path: "/admin/logs" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ],
  logistics: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/logistics/dashboard" },
    { icon: Route, label: "Routes", path: "/logistics/routes" },
    { icon: Route, label: "Stops", path: "/logistics/stops" },
    { icon: CalendarDays, label: "Schedule", path: "/logistics/schedules" },
    { icon: TrendingUp, label: "Reports", path: "/logistics/reports" },
  ],
  supervisor: [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/supervisor/dashboard",
    },
    { icon: BusFront, label: "Vehicles", path: "/supervisor/vehicles" },
    { icon: Users, label: "Drivers", path: "/supervisor/drivers" },
  ],
  maintenance: [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/maintenance/dashboard",
    },
    { icon: Wrench, label: "Maintenance", path: "/maintenance/history" },
  ],
  driver: [
    { icon: Route, label: "Trips", path: "/driver/trips" },
    { icon: List, label: "History", path: "/driver/history" },
  ],
};

const roleMap = {
  admin: "admin",
  logistics_officer: "logistics",
  depot_supervisor: "supervisor",
  maintenance_officer: "maintenance",
  driver: "driver",
};

export default function Sidebar({ userRole = "admin", isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const mappedRole = roleMap[userRole] || "admin";
  const items = menuItems[mappedRole] || menuItems.admin;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth");
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-56 bg-[#B71C1C] text-white pt-20 overflow-y-auto transition-transform duration-300 z-30 lg:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 lg:hidden p-2 hover:bg-[#8B0000] rounded-md"
        >
          <X size={20} />
        </button>

        <div className="px-4 py-4">
          <nav className="space-y-2">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActive
                        ? "bg-white text-[#B71C1C]"
                        : "text-white hover:bg-[#8B0000]"
                    }`
                  }
                  onClick={onClose}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-white hover:bg-[#8B0000] transition-colors mt-8"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="lg:ml-56" />
    </>
  );
}
