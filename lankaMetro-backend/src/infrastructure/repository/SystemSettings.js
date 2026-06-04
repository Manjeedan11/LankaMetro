import pool from "../db.js";

export async function get(key) {
  const result = await pool.query(
    "SELECT setting_value FROM system_settings WHERE setting_key = $1",
    [key]
  );
  return result.rows[0]?.setting_value || null;
}

export async function getAll() {
  const result = await pool.query(
    "SELECT setting_key, setting_value, updated_at, updated_by FROM system_settings ORDER BY setting_key"
  );
  return result.rows;
}

export async function set(key, value, updatedBy) {
  const result = await pool.query(
    `INSERT INTO system_settings (setting_key, setting_value, updated_by)
         VALUES ($1, $2, $3)
         ON CONFLICT (setting_key) DO UPDATE
         SET setting_value = EXCLUDED.setting_value,
             updated_at = CURRENT_TIMESTAMP,
             updated_by = EXCLUDED.updated_by
         RETURNING setting_key`,
    [key, value, updatedBy || null]
  );
  return result.rows[0]?.setting_key !== undefined;
}

export default {
  get,
  getAll,
  set,
};
