import { Outlet, Navigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import Sidebar from "../components/standalone/Sidebar";
import Navbar from "../components/standalone/Navbar";
import { logout } from "@/lib/features/authSlice";
import "leaflet/dist/leaflet.css";

export default function MainLayout() {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        userRole={user?.role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <Navbar
        title="Dashboard"
        userRole={user?.role || "User"}
        onMenuToggle={() => setSidebarOpen(true)}
        onLogout={handleLogout}
      />
      <main className="lg:ml-56 pt-16">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
