import express from "express";
import { authenticate } from "./middleware/auth.js";
import { allowRoles } from "./middleware/role.js";
import {
  getScheduleReport,
  getMaintenanceReport,
  getRouteSummary,
  exportScheduleReportPDF,
} from "../application/report.js";

export const reportRouter = express.Router();

reportRouter.use(authenticate);
reportRouter.use(allowRoles("logistics_officer", "depot_supervisor", "admin"));

reportRouter.get("/schedules", getScheduleReport);
reportRouter.get("/maintenance", getMaintenanceReport);
reportRouter.get("/routes", getRouteSummary);

reportRouter.get("/schedules/pdf", exportScheduleReportPDF);
