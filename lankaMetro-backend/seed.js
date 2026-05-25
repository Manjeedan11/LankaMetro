import bcrypt from "bcryptjs";
import pool from "./src/infrastructure/db.js";

const seedAdmin = async () => {
  const plainPassword = "Admin123";
  const hashed = await bcrypt.hash(plainPassword, 10);

  await pool.query(
    `
        INSERT INTO "user" (full_name, email, password_hash, role, status)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO NOTHING
    `,
    ["System Admin", "admin@system.com", hashed, "admin", "ACTIVE"]
  );

  console.log("Admin user seeded");
  await pool.end();
};

seedAdmin();
