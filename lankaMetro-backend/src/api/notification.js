import express from "express";
import { authenticate } from "./middleware/auth.js";
import {
  getNotifications,
  deleteNotification,
} from "../application/notification.js";

export const notificationRouter = express.Router();

notificationRouter.use(authenticate);

notificationRouter.get("/", getNotifications);

notificationRouter.delete("/:id", deleteNotification);
