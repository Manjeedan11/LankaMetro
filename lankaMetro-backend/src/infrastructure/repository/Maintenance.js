import pool from "../db.js";

export async function findAll(filters = {}) {
  let query = `
        SELECT m.*, v.plate_number
        FROM maintenance m
        JOIN vehicle v ON m.vehicle_id = v.vehicle_id
    `;
  const conditions = [];
  const values = [];
  let i = 1;
  if (filters.vehicleId) {
    conditions.push(`m.vehicle_id = $${i++}`);
    values.push(filters.vehicleId);
  }
  if (filters.status) {
    conditions.push(`m.status = $${i++}`);
    values.push(filters.status);
  }
  if (conditions.length) {
    query += " WHERE " + conditions.join(" AND ");
  }
  query += " ORDER BY m.service_date DESC";
  const result = await pool.query(query, values);
  return result.rows;
}

export async function findById(id) {
  const result = await pool.query(
    `
        SELECT m.*, v.plate_number
        FROM maintenance m
        JOIN vehicle v ON m.vehicle_id = v.vehicle_id
        WHERE m.maintenance_id = $1
    `,
    [id]
  );
  return result.rows[0] || null;
}

// ✅ NEW: Find non‑completed records for a vehicle on a specific date
export async function findByVehicleAndDate(
  vehicleId,
  serviceDate,
  excludeId = null
) {
  let query = `
    SELECT maintenance_id FROM maintenance
    WHERE vehicle_id = $1
      AND service_date = $2
      AND status != 'COMPLETED'
  `;
  const params = [vehicleId, serviceDate];
  if (excludeId) {
    query += ` AND maintenance_id != $3`;
    params.push(excludeId);
  }
  const result = await pool.query(query, params);
  return result.rows;
}

export async function create(maintenanceData) {
  const {
    vehicle_id,
    type,
    service_date,
    description,
    status = "SCHEDULED",
  } = maintenanceData;
  const result = await pool.query(
    `INSERT INTO maintenance (vehicle_id, type, service_date, description, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING maintenance_id`,
    [vehicle_id, type, service_date, description, status]
  );
  return result.rows[0].maintenance_id;
}

export async function update(id, updates) {
  const fields = [];
  const values = [];
  let i = 1;
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined && key !== "maintenance_id") {
      fields.push(`${key} = $${i}`);
      values.push(value);
      i++;
    }
  }
  if (fields.length === 0) return false;
  values.push(id);
  const query = `UPDATE maintenance SET ${fields.join(
    ", "
  )} WHERE maintenance_id = $${i}`;
  const result = await pool.query(query, values);
  return result.rowCount > 0;
}

export async function deleteById(id) {
  const result = await pool.query(
    "DELETE FROM maintenance WHERE maintenance_id = $1",
    [id]
  );
  return result.rowCount > 0;
}

export default {
  findAll,
  findById,
  findByVehicleAndDate,
  create,
  update,
  deleteById,
};
