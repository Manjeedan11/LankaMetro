import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import UserManagement from "./pages/admin/UserManagement";
import VehicleManagement from "./pages/admin/VehicleManagement";
import LogisticsDashboard from "./pages/logistics/LogisticsDashboard";
import RouteManagement from "./pages/logistics/RouteManagement";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouteManagement />
  </StrictMode>
);
