import express from "express";
import { authenticate } from "./middleware/auth.js";
import { allowRoles } from "./middleware/role.js";
import {
  getStops,
  getStopById,
  createStop,
  updateStop,
  deleteStop,
} from "../application/stop.js";

export const stopRouter = express.Router();
stopRouter.use(authenticate, allowRoles("logistics_officer"));

stopRouter.route("/").get(getStops).post(createStop);
stopRouter.route("/:id").get(getStopById).patch(updateStop).delete(deleteStop);
