import pool from "../db.js";

export async function findAll() {
  const result = await pool.query(
    "SELECT depot_id, depot_name, location, contact_number, status, latitude, longitude, created_at FROM depot ORDER BY depot_id"
  );
  return result.rows;
}

export async function findById(id) {
  const result = await pool.query(
    "SELECT depot_id, depot_name, location, contact_number, status, latitude, longitude, created_at FROM depot WHERE depot_id = $1",
    [id]
  );
  return result.rows[0] || null;
}

export async function create(depotData) {
  const {
    depot_name,
    location,
    contact_number,
    status = "ACTIVE",
    latitude,
    longitude,
  } = depotData;
  const result = await pool.query(
    `INSERT INTO depot (depot_name, location, contact_number, status, latitude, longitude)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING depot_id`,
    [
      depot_name,
      location,
      contact_number,
      status,
      latitude || null,
      longitude || null,
    ]
  );
  return result.rows[0].depot_id;
}

export async function update(id, updates) {
  const fields = [];
  const values = [];
  let i = 1;
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined && key !== "depot_id") {
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
    "UPDATE depot SET status = 'INACTIVE' WHERE depot_id = $1",
    [id]
  );
  return result.rowCount > 0;
}

export async function countActive() {
  const result = await pool.query(
    "SELECT COUNT(*) FROM depot WHERE status = 'ACTIVE'",
    []
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
