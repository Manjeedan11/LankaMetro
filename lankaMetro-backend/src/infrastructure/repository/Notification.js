import pool from "../db.js";

export async function findByDriverId(driverId) {
  const result = await pool.query(
    `SELECT notification_id, message, type, created_at
         FROM notification
         WHERE driver_id = $1
         ORDER BY created_at DESC`,
    [driverId]
  );
  return result.rows;
}

export async function create(notificationData) {
  const { message, type, driverId } = notificationData;
  const result = await pool.query(
    `INSERT INTO notification (message, type, driver_id)
         VALUES ($1, $2, $3)
         RETURNING notification_id`,
    [message, type, driverId]
  );
  return result.rows[0].notification_id;
}

export async function deleteById(id) {
  const result = await pool.query(
    "DELETE FROM notification WHERE notification_id = $1",
    [id]
  );
  return result.rowCount > 0;
}

export default { findByDriverId, create, deleteById };
