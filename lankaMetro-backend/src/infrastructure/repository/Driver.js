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

export async function findById(id, depotId) {
  const result = await pool.query(
    `SELECT d.driver_id, d.license_number, d.license_expiry, d.availability, d.user_id, d.depot_id,
                u.full_name, u.email, u.phone_number
         FROM driver d
         JOIN "user" u ON d.user_id = u.user_id
         WHERE d.driver_id = $1 AND d.depot_id = $2`,
    [id, depotId]
  );
  return result.rows[0] || null;
}

export async function findByUserId(userId) {
  const result = await pool.query("SELECT * FROM driver WHERE user_id = $1", [
    userId,
  ]);
  return result.rows[0] || null;
}

export async function update(id, depotId, updates) {
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
  values.push(id, depotId);
  const query = `UPDATE driver SET ${fields.join(
    ", "
  )} WHERE driver_id = $${i} AND depot_id = $${i + 1}`;
  const result = await pool.query(query, values);
  return result.rowCount > 0;
}

export async function updateAvailability(driverId, availability, depotId) {
  const result = await pool.query(
    "UPDATE driver SET availability = $1 WHERE driver_id = $2 AND depot_id = $3",
    [availability, driverId, depotId]
  );
  return result.rowCount > 0;
}

export async function findAvailableDrivers(date, startTime, endTime, depotId) {
  const query = `
        SELECT d.driver_id, u.full_name, d.license_number, d.license_expiry
        FROM driver d
        JOIN "user" u ON d.user_id = u.user_id
        WHERE d.depot_id = $1
          AND d.availability = 'AVAILABLE'
          AND d.license_expiry > CURRENT_DATE
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
  update,
  updateAvailability,
  findAvailableDrivers,
};
