import express from "express";
import { authenticate } from "./middleware/auth.js";
import { allowRoles } from "./middleware/role.js";
import {
  getSchedules,
  getScheduleById,
  getMySchedules,
  createSchedule,
  updateSchedule,
  cancelSchedule,
  updateScheduleStatus,
  getMyHistory,
} from "../application/schedule.js";

export const scheduleRouter = express.Router();

scheduleRouter.use(authenticate);

scheduleRouter.post("/", allowRoles("logistics_officer"), createSchedule);
scheduleRouter.patch("/:id", allowRoles("logistics_officer"), updateSchedule);
scheduleRouter.patch(
  "/:id/status",
  allowRoles("logistics_officer", "driver"),
  updateScheduleStatus
);
scheduleRouter.delete("/:id", allowRoles("logistics_officer"), cancelSchedule);

scheduleRouter.get(
  "/",
  allowRoles("logistics_officer", "depot_supervisor", "admin"),
  getSchedules
);

scheduleRouter.get("/my", authenticate, allowRoles("driver"), getMySchedules);

scheduleRouter.get(
  "/history",
  authenticate,
  allowRoles("driver"),
  getMyHistory
);

scheduleRouter.get(
  "/:id",
  allowRoles("logistics_officer", "depot_supervisor", "admin"),
  getScheduleById
);
