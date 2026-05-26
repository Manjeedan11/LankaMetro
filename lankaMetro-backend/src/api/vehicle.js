import express from "express";
import { authenticate } from "./middleware/auth.js";
import { allowRoles } from "./middleware/role.js";
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getAvailableVehicles,
} from "../application/vehicle.js";

export const vehicleRouter = express.Router();

vehicleRouter.use(authenticate);

vehicleRouter.post("/", allowRoles("admin"), createVehicle);
vehicleRouter.patch("/:id", allowRoles("admin"), updateVehicle);
vehicleRouter.delete("/:id", allowRoles("admin"), deleteVehicle);

vehicleRouter.get(
  "/",
  allowRoles(
    "admin",
    "logistics_officer",
    "maintenance_officer",
    "depot_supervisor"
  ),
  getVehicles
);
vehicleRouter.get(
  "/:id",
  allowRoles(
    "admin",
    "logistics_officer",
    "maintenance_officer",
    "depot_supervisor"
  ),
  getVehicleById
);

vehicleRouter.get(
  "/available",
  allowRoles("logistics_officer"),
  getAvailableVehicles
);
