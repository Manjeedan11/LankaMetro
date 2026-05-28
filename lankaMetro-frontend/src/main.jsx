import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
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

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <DriverHistory />
  </StrictMode>
);
