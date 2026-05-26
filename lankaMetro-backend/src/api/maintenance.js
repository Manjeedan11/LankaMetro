import express from "express";
import { authenticate } from "./middleware/auth.js";
import { allowRoles } from "./middleware/role.js";
import {
  getMaintenanceRecords,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  completeMaintenance,
} from "../application/maintenance.js";

export const maintenanceRouter = express.Router();

maintenanceRouter.use(authenticate);

maintenanceRouter.post(
  "/",
  allowRoles("maintenance_officer", "admin"),
  createMaintenance
);
maintenanceRouter.patch(
  "/:id",
  allowRoles("maintenance_officer", "admin"),
  updateMaintenance
);
maintenanceRouter.delete(
  "/:id",
  allowRoles("maintenance_officer", "admin"),
  deleteMaintenance
);
maintenanceRouter.patch(
  "/:id/complete",
  allowRoles("maintenance_officer", "admin"),
  completeMaintenance
);

maintenanceRouter.get(
  "/",
  allowRoles(
    "maintenance_officer",
    "admin",
    "logistics_officer",
    "depot_supervisor"
  ),
  getMaintenanceRecords
);
maintenanceRouter.get(
  "/:id",
  allowRoles(
    "maintenance_officer",
    "admin",
    "logistics_officer",
    "depot_supervisor"
  ),
  getMaintenanceById
);

export default maintenanceRouter;
