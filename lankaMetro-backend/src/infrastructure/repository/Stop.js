import pool from "../db.js";

export async function findAll(depotId) {
  const result = await pool.query(
    "SELECT stop_id, stop_name, location, latitude, longitude, depot_id FROM stop WHERE depot_id = $1 ORDER BY stop_name",
    [depotId]
  );
  return result.rows;
}

export async function findById(id, depotId) {
  const result = await pool.query(
    "SELECT stop_id, stop_name, location, latitude, longitude, depot_id FROM stop WHERE stop_id = $1 AND depot_id = $2",
    [id, depotId]
  );
  return result.rows[0] || null;
}

export async function findByNameAndDepot(stopName, depotId) {
  const result = await pool.query(
    "SELECT stop_id FROM stop WHERE stop_name = $1 AND depot_id = $2",
    [stopName, depotId]
  );
  return result.rows[0] || null;
}

export async function create(stopData) {
  const { stop_name, location, latitude, longitude, depot_id } = stopData;
  const result = await pool.query(
    `INSERT INTO stop (stop_name, location, latitude, longitude, depot_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING stop_id`,
    [stop_name, location, latitude || null, longitude || null, depot_id]
  );
  return result.rows[0].stop_id;
}

export async function update(id, depotId, updates) {
  const fields = [];
  const values = [];
  let i = 1;
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined && key !== "stop_id" && key !== "depot_id") {
      fields.push(`${key} = $${i}`);
      values.push(value);
      i++;
    }
  }
  if (fields.length === 0) return false;
  values.push(id, depotId);
  const query = `UPDATE stop SET ${fields.join(
    ", "
  )} WHERE stop_id = $${i} AND depot_id = $${i + 1}`;
  const result = await pool.query(query, values);
  return result.rowCount > 0;
}

export async function deleteById(id, depotId) {
  const result = await pool.query(
    "DELETE FROM stop WHERE stop_id = $1 AND depot_id = $2",
    [id, depotId]
  );
  return result.rowCount > 0;
}

export default {
  findAll,
  findById,
  findByNameAndDepot,
  create,
  update,
  deleteById,
};
