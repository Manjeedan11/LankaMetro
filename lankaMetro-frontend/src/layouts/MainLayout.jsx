import { Outlet, Navigate } from "react-router";
import { useSelector } from "react-redux";
import Sidebar from "@/components/standalone/Sidebar";

export default function MainLayout() {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole={user?.role} />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
