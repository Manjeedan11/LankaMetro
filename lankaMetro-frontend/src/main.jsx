import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import UserManagement from "./pages/admin/UserManagement";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserManagement />
  </StrictMode>
);
