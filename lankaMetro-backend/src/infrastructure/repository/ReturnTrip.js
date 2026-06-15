import pool from "../db.js";

export async function create(returnTripData) {
  const {
    original_schedule_id,
    departure_time,
    arrival_time,
    status,
    return_route_id,
  } = returnTripData;
  const result = await pool.query(
    `INSERT INTO return_trip (original_schedule_id, departure_time, arrival_time, status, return_route_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING return_trip_id`,
    [
      original_schedule_id,
      departure_time,
      arrival_time,
      status || "SCHEDULED",
      return_route_id,
    ]
  );
  return result.rows[0].return_trip_id;
}

export async function findByOriginalScheduleId(scheduleId) {
  const result = await pool.query(
    `SELECT * FROM return_trip WHERE original_schedule_id = $1`,
    [scheduleId]
  );
  return result.rows[0] || null;
}

export async function update(id, updates) {
  const fields = [];
  const values = [];
  let i = 1;
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined && key !== "return_trip_id") {
      fields.push(`${key} = $${i}`);
      values.push(value);
      i++;
    }
  }
  if (fields.length === 0) return false;
  values.push(id);
  const query = `UPDATE return_trip SET ${fields.join(
    ", "
  )} WHERE return_trip_id = $${i}`;
  const result = await pool.query(query, values);
  return result.rowCount > 0;
}

export async function findByDriverAndDate(driverId, date) {
  const result = await pool.query(
    `SELECT rt.return_trip_id as schedule_id,
            rt.departure_time,
            rt.arrival_time,
            rt.status,
            rt.return_route_id as route_id,
            r.route_name,
            v.plate_number,
            'RETURN' as trip_type
     FROM return_trip rt
     JOIN schedule s ON rt.original_schedule_id = s.schedule_id
     JOIN route r ON rt.return_route_id = r.route_id
     JOIN vehicle v ON s.vehicle_id = v.vehicle_id
     WHERE s.driver_id = $1
       AND s.schedule_date = $2
     ORDER BY rt.departure_time`,
    [driverId, date]
  );
  return result.rows;
}

// ✅ NEW: Check if driver already has a return trip overlapping with given time slot
export async function checkDriverReturnTripOverlap(
  driverId,
  date,
  startTime,
  endTime,
  excludeReturnTripId = null
) {
  let query = `
    SELECT rt.return_trip_id
    FROM return_trip rt
    JOIN schedule s ON rt.original_schedule_id = s.schedule_id
    WHERE s.driver_id = $1
      AND s.schedule_date = $2
      AND rt.departure_time < $4
      AND rt.arrival_time > $3
  `;
  const params = [driverId, date, startTime, endTime];
  if (excludeReturnTripId) {
    query += ` AND rt.return_trip_id != $5`;
    params.push(excludeReturnTripId);
  }
  const result = await pool.query(query, params);
  return result.rowCount > 0;
}

// ✅ NEW: Check if vehicle already has a return trip overlapping with given time slot
export async function checkVehicleReturnTripOverlap(
  vehicleId,
  date,
  startTime,
  endTime,
  excludeReturnTripId = null
) {
  let query = `
    SELECT rt.return_trip_id
    FROM return_trip rt
    JOIN schedule s ON rt.original_schedule_id = s.schedule_id
    WHERE s.vehicle_id = $1
      AND s.schedule_date = $2
      AND rt.departure_time < $4
      AND rt.arrival_time > $3
  `;
  const params = [vehicleId, date, startTime, endTime];
  if (excludeReturnTripId) {
    query += ` AND rt.return_trip_id != $5`;
    params.push(excludeReturnTripId);
  }
  const result = await pool.query(query, params);
  return result.rowCount > 0;
}

export async function findById(id) {
  const result = await pool.query(
    `SELECT * FROM return_trip WHERE return_trip_id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function updateStatus(id, status) {
  const result = await pool.query(
    `UPDATE return_trip SET status = $1 WHERE return_trip_id = $2`,
    [status, id]
  );
  return result.rowCount > 0;
}

export async function countRemainingToday(
  driverId,
  date,
  excludeReturnTripId = null
) {
  let query = `
    SELECT COUNT(*) FROM return_trip rt
    JOIN schedule s ON rt.original_schedule_id = s.schedule_id
    WHERE s.driver_id = $1 AND s.schedule_date = $2
      AND rt.status IN ('SCHEDULED', 'IN_PROGRESS')
  `;
  const params = [driverId, date];
  if (excludeReturnTripId) {
    query += ` AND rt.return_trip_id != $3`;
    params.push(excludeReturnTripId);
  }
  const result = await pool.query(query, params);
  return parseInt(result.rows[0].count);
}

export default {
  create,
  findByOriginalScheduleId,
  update,
  findByDriverAndDate,
  checkDriverReturnTripOverlap,
  checkVehicleReturnTripOverlap,
  findById,
  updateStatus,
  countRemainingToday,
};
