import pool from "../db.js";

export async function findAll(depotId) {
  const result = await pool.query(
    `SELECT d.driver_id, d.license_number, d.license_expiry, d.availability, d.user_id, d.depot_id,
                u.full_name, u.email, u.phone_number
         FROM driver d
         JOIN "user" u ON d.user_id = u.user_id
         WHERE d.depot_id = $1
         ORDER BY u.full_name`,
    [depotId]
  );
  return result.rows;
}

export async function findById(id, depotId, isAdmin = false) {
  let query = `
      SELECT d.driver_id, d.license_number, d.license_expiry, d.availability, d.user_id, d.depot_id,
             u.full_name, u.email, u.phone_number
      FROM driver d
      JOIN "user" u ON d.user_id = u.user_id
      WHERE d.driver_id = $1
  `;
  const params = [id];
  if (!isAdmin && depotId !== null) {
    query += ` AND d.depot_id = $2`;
    params.push(depotId);
  }
  const result = await pool.query(query, params);
  return result.rows[0] || null;
}

export async function findByUserId(userId) {
  const result = await pool.query("SELECT * FROM driver WHERE user_id = $1", [
    userId,
  ]);
  return result.rows[0] || null;
}

export async function create(driverData) {
  const { user_id, license_number, license_expiry, availability, depot_id } =
    driverData;
  const result = await pool.query(
    `INSERT INTO driver (user_id, license_number, license_expiry, availability, depot_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING driver_id`,
    [user_id, license_number, license_expiry, availability, depot_id]
  );
  return result.rows[0].driver_id;
}

export async function update(id, depotId, updates, isAdmin = false) {
  const fields = [];
  const values = [];
  let i = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined && key !== "driver_id" && key !== "depot_id") {
      fields.push(`${key} = $${i}`);
      values.push(value);
      i++;
    }
  }

  if (fields.length === 0) return false;

  let query = `UPDATE driver SET ${fields.join(", ")} WHERE driver_id = $${i}`;
  values.push(id);

  // If not admin and depotId is provided, add depot filter
  if (!isAdmin && depotId !== null) {
    query += ` AND depot_id = $${i + 1}`;
    values.push(depotId);
  }

  const result = await pool.query(query, values);
  return result.rowCount > 0;
}

export async function updateAvailability(driverId, availability, depotId) {
  const result = await pool.query(
    `UPDATE driver SET availability = $1 WHERE driver_id = $2 AND depot_id = $3`,
    [availability, driverId, depotId]
  );
  return result.rowCount > 0;
}

export async function deleteByUserId(userId) {
  const result = await pool.query(`DELETE FROM driver WHERE user_id = $1`, [
    userId,
  ]);
  return result.rowCount > 0;
}

export default {
  findAll,
  findById,
  findByUserId,
  create,
  update,
  updateAvailability,
  deleteByUserId,
};
