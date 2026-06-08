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

export default {
  create,
  findByOriginalScheduleId,
  update,
  findByDriverAndDate,
};
