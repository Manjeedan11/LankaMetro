import pool from "../db.js";

async function create({ user_id, message, type, driver_id = null }) {
  const result = await pool.query(
    `INSERT INTO notification (user_id, message, type, driver_id, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING notification_id`,
    [user_id, message, type, driver_id]
  );
  return result.rows[0].notification_id;
}

async function findByUserId(userId) {
  const result = await pool.query(
    `SELECT notification_id, message, type, created_at, user_id, driver_id
     FROM notification
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function findByDriverId(driverId) {
  const result = await pool.query(
    `SELECT notification_id, message, type, created_at, user_id, driver_id
     FROM notification
     WHERE driver_id = $1
     ORDER BY created_at DESC`,
    [driverId]
  );
  return result.rows;
}

async function deleteById(id) {
  const result = await pool.query(
    `DELETE FROM notification WHERE notification_id = $1`,
    [id]
  );
  return result.rowCount > 0;
}

export default {
  create,
  findByUserId,
  findByDriverId,
  deleteById,
};
