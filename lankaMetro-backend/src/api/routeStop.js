import express from "express";
import { authenticate } from "./middleware/auth.js";
import { allowRoles } from "./middleware/role.js";
import {
  getRouteStops,
  addStopToRoute,
  removeStopFromRoute,
  reorderRouteStops,
} from "../application/routeStop.js";

export const routeStopRouter = express.Router();
routeStopRouter.use(authenticate, allowRoles("logistics_officer"));

routeStopRouter.get("/:routeId/stops", getRouteStops);
routeStopRouter.post("/:routeId/stops", addStopToRoute);
routeStopRouter.delete("/:routeId/stops", removeStopFromRoute);
routeStopRouter.patch("/:routeId/stops/reorder", reorderRouteStops);
