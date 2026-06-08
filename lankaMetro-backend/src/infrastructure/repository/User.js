import pool from "../db.js";

export async function findAll() {
  const result = await pool.query(`
        SELECT user_id, full_name, email, role, phone_number, status, depot_id, created_at
        FROM "user"
        ORDER BY user_id
    `);
  return result.rows;
}

export async function findById(id) {
  const result = await pool.query(
    `
        SELECT user_id, full_name, email, role, phone_number, status, depot_id, created_at
        FROM "user"
        WHERE user_id = $1
    `,
    [id]
  );
  return result.rows[0] || null;
}

export async function findByEmail(email) {
  const result = await pool.query(
    `
        SELECT user_id, full_name, email, password_hash, role, phone_number, status, depot_id
        FROM "user"
        WHERE email = $1
    `,
    [email]
  );
  return result.rows[0] || null;
}

export async function create(userData) {
  const {
    full_name,
    email,
    password_hash,
    role,
    phone_number,
    depot_id,
    status = "ACTIVE",
  } = userData;
  const result = await pool.query(
    `INSERT INTO "user" (full_name, email, password_hash, role, phone_number, depot_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING user_id`,
    [full_name, email, password_hash, role, phone_number, depot_id, status]
  );
  return result.rows[0].user_id;
}

export async function update(id, updates) {
  const fields = [];
  const values = [];
  let i = 1;
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined && key !== "user_id") {
      fields.push(`${key} = $${i}`);
      values.push(value);
      i++;
    }
  }
  if (fields.length === 0) return false;
  values.push(id);
  const query = `UPDATE "user" SET ${fields.join(", ")} WHERE user_id = $${i}`;
  const result = await pool.query(query, values);
  return result.rowCount > 0;
}

export async function deleteById(id) {
  const result = await pool.query(
    `UPDATE "user" SET status = $1 WHERE user_id = $2`,
    ["INACTIVE", id]
  );
  return result.rowCount > 0;
}

export async function countByRole(role) {
  const result = await pool.query(
    `SELECT COUNT(*) FROM "user" WHERE role = $1 AND status = 'ACTIVE'`,
    [role]
  );
  return parseInt(result.rows[0].count);
}

export async function findByDepot(depotId) {
  const result = await pool.query(
    `
        SELECT user_id, full_name, email, role, phone_number, status
        FROM "user"
        WHERE depot_id = $1
        ORDER BY full_name
    `,
    [depotId]
  );
  return result.rows;
}

export async function findByRoleAndDepot(role, depotId) {
  const result = await pool.query(
    `SELECT user_id, full_name, email FROM "user" WHERE role = $1 AND depot_id = $2 AND status = 'ACTIVE'`,
    [role, depotId]
  );
  return result.rows;
}

export default {
  findAll,
  findById,
  findByEmail,
  create,
  update,
  deleteById,
  countByRole,
  findByDepot,
  findByRoleAndDepot,
};
