import pool from "../db.js";

export async function create(logData) {
  const { user_id, user_name, action, details, depot_id } = logData;
  const result = await pool.query(
    `INSERT INTO system_log (user_id, user_name, action, details, depot_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING log_id`,
    [user_id || null, user_name, action, details, depot_id || null]
  );
  return result.rows[0].log_id;
}

export async function findAll(limit = 100, offset = 0, filters = {}) {
  let query = `
        SELECT log_id, log_time, user_id, user_name, action, details, depot_id
        FROM system_log
        WHERE 1=1
    `;
  const values = [];
  let i = 1;
  if (filters.startDate) {
    query += ` AND log_time >= $${i++}`;
    values.push(filters.startDate);
  }
  if (filters.endDate) {
    query += ` AND log_time <= $${i++}`;
    values.push(filters.endDate);
  }
  if (filters.userId) {
    query += ` AND user_id = $${i++}`;
    values.push(filters.userId);
  }
  if (filters.action) {
    query += ` AND action ILIKE $${i++}`;
    values.push(`%${filters.action}%`);
  }
  query += ` ORDER BY log_time DESC LIMIT $${i++} OFFSET $${i++}`;
  values.push(limit, offset);
  const result = await pool.query(query, values);
  return result.rows;
}

export async function count(filters = {}) {
  let query = `SELECT COUNT(*) FROM system_log WHERE 1=1`;
  const values = [];
  let i = 1;
  if (filters.startDate) {
    query += ` AND log_time >= $${i++}`;
    values.push(filters.startDate);
  }
  if (filters.endDate) {
    query += ` AND log_time <= $${i++}`;
    values.push(filters.endDate);
  }
  if (filters.userId) {
    query += ` AND user_id = $${i++}`;
    values.push(filters.userId);
  }
  if (filters.action) {
    query += ` AND action ILIKE $${i++}`;
    values.push(`%${filters.action}%`);
  }
  const result = await pool.query(query, values);
  return parseInt(result.rows[0].count);
}

export default {
  create,
  findAll,
  count,
};
