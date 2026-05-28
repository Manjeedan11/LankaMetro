import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import UserManagement from "./pages/admin/UserManagement";
import VehicleManagement from "./pages/admin/VehicleManagement";
import LogisticsDashboard from "./pages/logistics/LogisticsDashboard";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LogisticsDashboard />
  </StrictMode>
);
