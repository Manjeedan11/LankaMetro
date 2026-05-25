import pool from "../db.js";

export async function findAll() {
  const result = await pool.query(`
        SELECT d.driver_id, d.license_number, d.license_expiry, d.availability, d.depot_id,
               u.user_id, u.full_name, u.email, u.phone_number
        FROM driver d
        JOIN "user" u ON d.user_id = u.user_id
        ORDER BY d.driver_id
    `);
  return result.rows;
}

export async function findById(id) {
  const result = await pool.query(
    `
        SELECT d.driver_id, d.license_number, d.license_expiry, d.availability, d.depot_id,
               u.user_id, u.full_name, u.email, u.phone_number
        FROM driver d
        JOIN "user" u ON d.user_id = u.user_id
        WHERE d.driver_id = $1
    `,
    [id]
  );
  return result.rows[0] || null;
}

export async function findByUserId(userId) {
  const result = await pool.query(
    `
        SELECT driver_id, license_number, license_expiry, availability, depot_id
        FROM driver
        WHERE user_id = $1
    `,
    [userId]
  );
  return result.rows[0] || null;
}

export async function create(driverData) {
  const {
    user_id,
    license_number,
    license_expiry,
    availability = "AVAILABLE",
    depot_id,
  } = driverData;
  const result = await pool.query(
    `INSERT INTO driver (user_id, license_number, license_expiry, availability, depot_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING driver_id`,
    [user_id, license_number, license_expiry, availability, depot_id]
  );
  return result.rows[0].driver_id;
}

export async function update(id, updates) {
  const fields = [];
  const values = [];
  let i = 1;
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined && key !== "driver_id") {
      fields.push(`${key} = $${i}`);
      values.push(value);
      i++;
    }
  }
  if (fields.length === 0) return false;
  values.push(id);
  const query = `UPDATE driver SET ${fields.join(
    ", "
  )} WHERE driver_id = $${i}`;
  const result = await pool.query(query, values);
  return result.rowCount > 0;
}

export async function deleteById(id) {
  const result = await pool.query("DELETE FROM driver WHERE driver_id = $1", [
    id,
  ]);
  return result.rowCount > 0;
}

export async function deleteByUserId(userId) {
  const result = await pool.query("DELETE FROM driver WHERE user_id = $1", [
    userId,
  ]);
  return result.rowCount > 0;
}

export async function findAvailableDrivers(date, startTime, endTime, depotId) {
  const query = `
        SELECT d.driver_id, d.availability, u.full_name
        FROM driver d
        JOIN "user" u ON d.user_id = u.user_id
        WHERE d.depot_id = $1
          AND d.availability = 'AVAILABLE'
          AND NOT EXISTS (
              SELECT 1 FROM schedule s
              WHERE s.driver_id = d.driver_id
                AND s.schedule_date = $2
                AND (s.departure_time, s.arrival_time) OVERLAPS ($3, $4)
          )
        ORDER BY u.full_name
    `;
  const result = await pool.query(query, [depotId, date, startTime, endTime]);
  return result.rows;
}

export default {
  findAll,
  findById,
  findByUserId,
  create,
  update,
  deleteById,
  deleteByUserId,
  findAvailableDrivers,
};
