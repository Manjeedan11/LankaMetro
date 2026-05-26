import express from "express";
import { authenticate } from "./middleware/auth.js";
import { allowRoles } from "./middleware/role.js";
import {
  getDrivers,
  getDriverById,
  updateDriver,
  updateDriverAvailability,
  getAvailableDrivers,
} from "../application/driver.js";

export const driverRouter = express.Router();

driverRouter.use(authenticate);

driverRouter.get(
  "/",
  allowRoles("admin", "logistics_officer", "depot_supervisor"),
  getDrivers
);
driverRouter.get(
  "/:id",
  allowRoles("admin", "logistics_officer", "depot_supervisor"),
  getDriverById
);

driverRouter.get(
  "/available",
  allowRoles("logistics_officer"),
  getAvailableDrivers
);

driverRouter.patch("/:id", updateDriver);

driverRouter.patch("/:id/availability", updateDriverAvailability);
