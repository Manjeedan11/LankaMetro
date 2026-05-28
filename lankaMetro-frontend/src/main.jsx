import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AdminDashboard />
  </StrictMode>
);
