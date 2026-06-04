import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { store } from "./lib/store";
import "./index.css";
import LoginPage from "./pages/auth/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DepotManagement from "./pages/admin/DepotManagement";
import UserManagement from "./pages/admin/UserManagement";
import VehicleManagement from "./pages/admin/VehicleManagement";
import LogisticsDashboard from "./pages/logistics/LogisticsDashboard";
import RouteManagement from "./pages/logistics/RouteManagement";
import ScheduleManagement from "./pages/logistics/ScheduleManagement";
import Reports from "./pages/logistics/Reports";
import DepotSupervisorDashboard from "./pages/depot/DepotSupervisorDashboard";
import Fleet from "./pages/depot/Fleet";
import Drivers from "./pages/depot/Drivers";
import MaintenanceDashboard from "./pages/maintenance/MaintenanceDashboard";
import MaintenanceHistory from "./pages/maintenance/MaintenanceHistory";
import DriverTrips from "./pages/driver/DriverTrips";
import DriverHistory from "./pages/driver/DriverHistory";
import MainLayout from "./layouts/MainLayout";
import StopManagement from "./pages/logistics/StopManagement";
import MaintenanceReports from "./pages/maintenance/MaintenanceReports";
import SystemLogs from "./pages/admin/SystemLogs";
import SystemSettings from "./pages/admin/SystemSettings";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/auth" replace />} />

          <Route element={<MainLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/depots" element={<DepotManagement />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/vehicles" element={<VehicleManagement />} />
            <Route path="/admin/logs" element={<SystemLogs />} />
            <Route path="/admin/settings" element={<SystemSettings />} />

            <Route
              path="/logistics/dashboard"
              element={<LogisticsDashboard />}
            />
            <Route path="/logistics/routes" element={<RouteManagement />} />
            <Route path="/logistics/stops" element={<StopManagement />} />
            <Route
              path="/logistics/schedules"
              element={<ScheduleManagement />}
            />
            <Route path="/logistics/reports" element={<Reports />} />

            <Route
              path="/supervisor/dashboard"
              element={<DepotSupervisorDashboard />}
            />
            <Route path="/supervisor/vehicles" element={<Fleet />} />
            <Route path="/supervisor/drivers" element={<Drivers />} />

            <Route
              path="/maintenance/dashboard"
              element={<MaintenanceDashboard />}
            />
            <Route
              path="/maintenance/history"
              element={<MaintenanceHistory />}
            />
            <Route
              path="/maintenance/reports"
              element={<MaintenanceReports />}
            />

            <Route path="/driver/dashboard" element={<DriverTrips />} />
            <Route path="/driver/trips" element={<DriverTrips />} />
            <Route path="/driver/history" element={<DriverHistory />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
