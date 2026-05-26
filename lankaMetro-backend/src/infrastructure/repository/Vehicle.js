import pool from "../db.js";

export async function findAll(depotId = null) {
  let query = "SELECT * FROM vehicle";
  const params = [];
  if (depotId) {
    query += " WHERE depot_id = $1";
    params.push(depotId);
  }
  query += " ORDER BY vehicle_id";
  const result = await pool.query(query, params);
  return result.rows;
}

export async function findById(id) {
  const result = await pool.query(
    "SELECT * FROM vehicle WHERE vehicle_id = $1",
    [id]
  );
  return result.rows[0] || null;
}

export async function create(vehicleData) {
  const {
    plate_number,
    capacity,
    fuel_type,
    status = "ACTIVE",
    depot_id,
  } = vehicleData;
  const result = await pool.query(
    `INSERT INTO vehicle (plate_number, capacity, fuel_type, status, depot_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING vehicle_id`,
    [plate_number, capacity, fuel_type, status, depot_id]
  );
  return result.rows[0].vehicle_id;
}

export async function update(id, updates) {
  const fields = [];
  const values = [];
  let i = 1;
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined && key !== "vehicle_id") {
      fields.push(`${key} = $${i}`);
      values.push(value);
      i++;
    }
  }
  if (fields.length === 0) return false;
  values.push(id);
  const query = `UPDATE vehicle SET ${fields.join(
    ", "
  )} WHERE vehicle_id = $${i}`;
  const result = await pool.query(query, values);
  return result.rowCount > 0;
}

export async function deleteById(id) {
  // Soft delete – set status = 'RETIRED'
  const result = await pool.query(
    `UPDATE vehicle SET status = $1 WHERE vehicle_id = $2`,
    ["RETIRED", id]
  );
  return result.rowCount > 0;
}

export async function findAvailableVehicles(date, startTime, endTime, depotId) {
  const query = `
        SELECT v.vehicle_id, v.plate_number, v.capacity, v.fuel_type
        FROM vehicle v
        WHERE v.depot_id = $1
          AND v.status = 'ACTIVE'
          AND NOT EXISTS (
              SELECT 1 FROM schedule s
              WHERE s.vehicle_id = v.vehicle_id
                AND s.schedule_date = $2
                AND (s.departure_time, s.arrival_time) OVERLAPS ($3, $4)
          )
        ORDER BY v.plate_number
    `;
  const result = await pool.query(query, [depotId, date, startTime, endTime]);
  return result.rows;
}

export async function updateStatus(vehicleId, newStatus) {
  const result = await pool.query(
    "UPDATE vehicle SET status = $1 WHERE vehicle_id = $2",
    [newStatus, vehicleId]
  );
  return result.rowCount > 0;
}

export default {
  findAll,
  findById,
  create,
  update,
  deleteById,
  findAvailableVehicles,
  updateStatus,
};
