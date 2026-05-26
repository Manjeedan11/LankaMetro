import express from "express";
import {
  getDepots,
  getDepotById,
  createDepot,
  updateDepot,
  deleteDepot,
} from "../application/depot.js";
import { authenticate } from "./middleware/auth.js";
import { allowRoles } from "./middleware/role.js";

export const depotRouter = express.Router();

depotRouter.use(authenticate, allowRoles("admin"));

depotRouter.route("/").get(getDepots).post(createDepot);
depotRouter
  .route("/:id")
  .get(getDepotById)
  .patch(updateDepot)
  .delete(deleteDepot);
