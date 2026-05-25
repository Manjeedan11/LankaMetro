import express from "express";
import "dotenv/config";
import pool, { testConnection, closeDatabase } from "./infrastructure/db.js";

const app = express();
app.use(express.json());

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
