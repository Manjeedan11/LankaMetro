import express from "express";
import { authenticate } from "./middleware/auth.js";
import { allowRoles } from "./middleware/role.js";
import { updateReturnTripStatus } from "../application/returnTrip.js";

export const returnTripRouter = express.Router();

returnTripRouter.patch(
  "/:id/status",
  authenticate,
  allowRoles("driver", "admin", "depot_supervisor", "logistics_officer"),
  updateReturnTripStatus
);
