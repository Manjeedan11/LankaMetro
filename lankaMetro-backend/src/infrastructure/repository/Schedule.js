import pool from "../db.js";

export async function findAll(depotId, date = null) {
  let query = `
        SELECT s.*, 
               r.route_name, r.start_point, r.destination,
               v.plate_number,
               u.full_name as driver_name
        FROM schedule s
        JOIN route r ON s.route_id = r.route_id
        JOIN vehicle v ON s.vehicle_id = v.vehicle_id
        JOIN driver d ON s.driver_id = d.driver_id
        JOIN "user" u ON d.user_id = u.user_id
        WHERE s.depot_id = $1
    `;
  const params = [depotId];
  if (date) {
    query += ` AND s.schedule_date = $2`;
    params.push(date);
  }
  query += ` ORDER BY s.schedule_date, s.departure_time`;
  const result = await pool.query(query, params);
  return result.rows;
}

export async function findById(id, depotId) {
  const result = await pool.query(
    `SELECT s.*, 
                r.route_name, r.start_point, r.destination,
                v.plate_number,
                u.full_name as driver_name
         FROM schedule s
         JOIN route r ON s.route_id = r.route_id
         JOIN vehicle v ON s.vehicle_id = v.vehicle_id
         JOIN driver d ON s.driver_id = d.driver_id
         JOIN "user" u ON d.user_id = u.user_id
         WHERE s.schedule_id = $1 AND s.depot_id = $2`,
    [id, depotId]
  );
  return result.rows[0] || null;
}

export async function create(scheduleData) {
  const {
    schedule_date,
    departure_time,
    arrival_time,
    status,
    route_id,
    vehicle_id,
    driver_id,
    depot_id,
  } = scheduleData;
  const result = await pool.query(
    `INSERT INTO schedule (schedule_date, departure_time, arrival_time, status, route_id, vehicle_id, driver_id, depot_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING schedule_id`,
    [
      schedule_date,
      departure_time,
      arrival_time,
      status || "SCHEDULED",
      route_id,
      vehicle_id,
      driver_id,
      depot_id,
    ]
  );
  return result.rows[0].schedule_id;
}

export async function update(id, depotId, updates) {
  const fields = [];
  const values = [];
  let i = 1;
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined && key !== "schedule_id" && key !== "depot_id") {
      fields.push(`${key} = $${i}`);
      values.push(value);
      i++;
    }
  }
  if (fields.length === 0) return false;
  values.push(id, depotId);
  const query = `UPDATE schedule SET ${fields.join(
    ", "
  )} WHERE schedule_id = $${i} AND depot_id = $${i + 1}`;
  const result = await pool.query(query, values);
  return result.rowCount > 0;
}

export async function cancel(id, depotId) {
  const result = await pool.query(
    `UPDATE schedule SET status = $1 WHERE schedule_id = $2 AND depot_id = $3`,
    ["CANCELLED", id, depotId]
  );
  return result.rowCount > 0;
}

// Replace checkDriverOverlap with:
export async function checkDriverOverlap(
  driverId,
  date,
  startTime,
  endTime,
  excludeScheduleId = null
) {
  let query = `
      SELECT schedule_id FROM schedule
      WHERE driver_id = $1
        AND schedule_date = $2
        AND departure_time < $4
        AND arrival_time > $3
  `;
  const params = [driverId, date, startTime, endTime];
  if (excludeScheduleId) {
    query += ` AND schedule_id != $5`;
    params.push(excludeScheduleId);
  }
  const result = await pool.query(query, params);
  return result.rowCount > 0;
}

// Similarly for checkVehicleOverlap:
export async function checkVehicleOverlap(
  vehicleId,
  date,
  startTime,
  endTime,
  excludeScheduleId = null
) {
  let query = `
      SELECT schedule_id FROM schedule
      WHERE vehicle_id = $1
        AND schedule_date = $2
        AND departure_time < $4
        AND arrival_time > $3
  `;
  const params = [vehicleId, date, startTime, endTime];
  if (excludeScheduleId) {
    query += ` AND schedule_id != $5`;
    params.push(excludeScheduleId);
  }
  const result = await pool.query(query, params);
  return result.rowCount > 0;
}

export async function countRemainingToday(driverId, date, excludeScheduleId) {
  const result = await pool.query(
    `SELECT COUNT(*) FROM schedule
     WHERE driver_id = $1
       AND schedule_date = $2
       AND schedule_id != $3
       AND status IN ('SCHEDULED', 'IN_PROGRESS')`,
    [driverId, date, excludeScheduleId]
  );
  return parseInt(result.rows[0].count);
}

export async function checkExactDuplicate(
  routeId,
  date,
  departureTime,
  arrivalTime,
  excludeScheduleId = null
) {
  let query = `
    SELECT schedule_id FROM schedule
    WHERE route_id = $1
      AND schedule_date = $2
      AND departure_time::text = $3
      AND arrival_time::text = $4
  `;
  const params = [routeId, date, departureTime, arrivalTime];
  if (excludeScheduleId) {
    query += ` AND schedule_id != $5`;
    params.push(excludeScheduleId);
  }
  const result = await pool.query(query, params);
  return result.rowCount > 0;
}

export default {
  findAll,
  findById,
  create,
  update,
  cancel,
  checkDriverOverlap,
  checkVehicleOverlap,
  countRemainingToday,
  checkExactDuplicate,
};
