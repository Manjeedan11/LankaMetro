import express from "express";
import "dotenv/config";
import pool, { testConnection, closeDatabase } from "./infrastructure/db.js";
import globalErrorHandlingMiddleware from "./api/middleware/global-error-handling.js";
import { userRouter } from "./api/user.js";
import { depotRouter } from "./api/depot.js";
import { routeRouter } from "./api/route.js";
import { stopRouter } from "./api/stop.js";
import { routeStopRouter } from "./api/routeStop.js";
import { vehicleRouter } from "./api/vehicle.js";
import maintenanceRouter from "./api/maintenance.js";
import { authenticate } from "./api/middleware/auth.js";
import { authRouter } from "./api/auth.js";
import { driverRouter } from "./api/driver.js";
import { scheduleRouter } from "./api/schedule.js";
import { notificationRouter } from "./api/notification.js";

const app = express();
app.use(express.json());

app.use("/api/users", authenticate, userRouter);
app.use("/api/depots", depotRouter);
app.use("/api/route", routeRouter);
app.use("/api/stops", stopRouter);
app.use("/api/routes", routeStopRouter);
app.use("/api/vehicles", vehicleRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/drivers", driverRouter);
app.use("/api/schedules", scheduleRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/auth", authRouter);

app.use(globalErrorHandlingMiddleware);
(async () => {
  const connected = await testConnection();
  if (!connected) {
    console.error("⚠️ Database connection failed – endpoints may not work.");
  }
})();

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down...");
  await closeDatabase();
  server.close(() => process.exit(0));
});
