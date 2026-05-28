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

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <DepotSupervisorDashboard />
  </StrictMode>
);
