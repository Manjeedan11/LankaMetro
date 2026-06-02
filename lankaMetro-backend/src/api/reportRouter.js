import express from "express";
import { authenticate } from "./middleware/auth.js";
import { allowRoles } from "./middleware/role.js";
import {
  getScheduleReport,
  getMaintenanceReport,
  getRouteSummary,
  exportScheduleReportPDF,
  exportMaintenanceReportPDF,
} from "../application/report.js";

export const reportRouter = express.Router();

reportRouter.use(authenticate);
reportRouter.use(
  allowRoles(
    "logistics_officer",
    "depot_supervisor",
    "admin",
    "maintenance_officer"
  )
);

reportRouter.get("/schedules", getScheduleReport);
reportRouter.get("/maintenance", getMaintenanceReport);
reportRouter.get("/routes", getRouteSummary);

reportRouter.get("/schedules/pdf", exportScheduleReportPDF);
reportRouter.get("/maintenance/pdf", exportMaintenanceReportPDF);
