import pool from "../db.js";

export async function findAll(depotId) {
  const result = await pool.query(
    "SELECT * FROM route WHERE depot_id = $1 ORDER BY route_id",
    [depotId]
  );
  return result.rows;
}

export async function findById(id, depotId) {
  const result = await pool.query(
    "SELECT * FROM route WHERE route_id = $1 AND depot_id = $2",
    [id, depotId]
  );
  return result.rows[0] || null;
}

export async function findByRouteNo(routeNo, depotId) {
  const result = await pool.query(
    "SELECT * FROM route WHERE route_no = $1 AND depot_id = $2",
    [routeNo, depotId]
  );
  return result.rows[0] || null;
}

export async function create(routeData) {
  const {
    route_no,
    route_name,
    start_point,
    destination,
    distance_txt,
    subroute_info,
    availability,
    depot_id,
  } = routeData;
  const result = await pool.query(
    `INSERT INTO route (route_no, route_name, start_point, destination, distance_txt, subroute_info, availability, depot_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING route_id`,
    [
      route_no,
      route_name,
      start_point,
      destination,
      distance_txt,
      subroute_info,
      availability || "ACTIVE",
      depot_id,
    ]
  );
  return result.rows[0].route_id;
}

export async function update(id, depotId, updates) {
  const fields = [];
  const values = [];
  let i = 1;
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined && key !== "route_id" && key !== "depot_id") {
      fields.push(`${key} = $${i}`);
      values.push(value);
      i++;
    }
  }
  if (fields.length === 0) return false;
  values.push(id, depotId);
  const query = `UPDATE route SET ${fields.join(
    ", "
  )} WHERE route_id = $${i} AND depot_id = $${i + 1}`;
  const result = await pool.query(query, values);
  return result.rowCount > 0;
}

export async function deleteById(id, depotId) {
  const result = await pool.query(
    "UPDATE route SET availability = $1 WHERE route_id = $2 AND depot_id = $3",
    ["INACTIVE", id, depotId]
  );
  return result.rowCount > 0;
}

export default {
  findAll,
  findById,
  findByRouteNo,
  create,
  update,
  deleteById,
};
