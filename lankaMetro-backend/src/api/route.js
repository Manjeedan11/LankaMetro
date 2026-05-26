import express from "express";
import {
  getRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
} from "../application/route.js";
import { authenticate } from "./middleware/auth.js";
import { allowRoles } from "./middleware/role.js";

export const routeRouter = express.Router();

routeRouter.use(authenticate, allowRoles("logistics_officer", "admin"));

routeRouter.route("/").get(getRoutes).post(createRoute);
routeRouter
  .route("/:id")
  .get(getRouteById)
  .patch(updateRoute)
  .delete(deleteRoute);
