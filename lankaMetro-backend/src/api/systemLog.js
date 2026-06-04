import express from "express";
import { authenticate } from "./middleware/auth.js";
import { allowRoles } from "./middleware/role.js";
import { getSystemLogs } from "../application/systemLog.js";

export const systemLogRouter = express.Router();
systemLogRouter.use(authenticate, allowRoles("admin"));

systemLogRouter.get("/", getSystemLogs);
