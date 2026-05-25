import pool from "../db.js";

export async function findAll() {
  const result = await pool.query("SELECT * FROM depot ORDER BY depot_id");
  return result.rows;
}

export async function findById(id) {
  const result = await pool.query("SELECT * FROM depot WHERE depot_id = $1", [
    id,
  ]);
  return result.rows[0] || null;
}

export async function create(depotData) {
  const { depot_name, location, contact_number, status = "ACTIVE" } = depotData;
  const result = await pool.query(
    `INSERT INTO depot (depot_name, location, contact_number, status)
         VALUES ($1, $2, $3, $4)
         RETURNING depot_id`,
    [depot_name, location, contact_number, status]
  );
  return result.rows[0].depot_id;
}

export async function update(id, updates) {
  const fields = [];
  const values = [];
  let i = 1;
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      fields.push(`${key} = $${i}`);
      values.push(value);
      i++;
    }
  }
  if (fields.length === 0) return false;
  values.push(id);
  const query = `UPDATE depot SET ${fields.join(", ")} WHERE depot_id = $${i}`;
  const result = await pool.query(query, values);
  return result.rowCount > 0;
}

export async function disable(id) {
  const result = await pool.query(
    "UPDATE depot SET status = $1 WHERE depot_id = $2",
    ["INACTIVE", id]
  );
  return result.rowCount > 0;
}

export async function countActive() {
  const result = await pool.query(
    "SELECT COUNT(*) FROM depot WHERE status = $1",
    ["ACTIVE"]
  );
  return parseInt(result.rows[0].count);
}

export default {
  findAll,
  findById,
  create,
  update,
  disable,
  countActive,
};
