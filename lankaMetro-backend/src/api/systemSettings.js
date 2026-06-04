import express from "express";
import { authenticate } from "./middleware/auth.js";
import { allowRoles } from "./middleware/role.js";
import { getSettings, updateSetting } from "../application/systemSettings.js";

export const systemSettingsRouter = express.Router();
systemSettingsRouter.use(authenticate, allowRoles("admin"));

systemSettingsRouter.get("/", getSettings);
systemSettingsRouter.patch("/:key", updateSetting);
