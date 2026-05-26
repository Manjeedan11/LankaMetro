import pool from "../db.js";

export async function findByRoute(routeId, depotId) {
  const result = await pool.query(
    `SELECT rs.route_stop_id, rs.stop_order, s.stop_id, s.stop_name, s.location
         FROM route_stop rs
         JOIN stop s ON rs.stop_id = s.stop_id
         JOIN route r ON rs.route_id = r.route_id
         WHERE r.route_id = $1 AND r.depot_id = $2
         ORDER BY rs.stop_order`,
    [routeId, depotId]
  );
  return result.rows;
}

export async function addStop(routeId, stopId, order, depotId) {
  // Ensure route belongs to the depot
  const routeCheck = await pool.query(
    "SELECT 1 FROM route WHERE route_id = $1 AND depot_id = $2",
    [routeId, depotId]
  );
  if (routeCheck.rowCount === 0)
    throw new Error("Route not found in this depot");

  // Insert new stop order (shift later orders if needed)
  await pool.query(
    `UPDATE route_stop SET stop_order = stop_order + 1
         WHERE route_id = $1 AND stop_order >= $2`,
    [routeId, order]
  );
  const result = await pool.query(
    `INSERT INTO route_stop (route_id, stop_id, stop_order)
         VALUES ($1, $2, $3)
         RETURNING route_stop_id`,
    [routeId, stopId, order]
  );
  return result.rows[0].route_stop_id;
}

export async function removeStop(routeId, stopOrder, depotId) {
  // Verify route ownership
  const routeCheck = await pool.query(
    "SELECT 1 FROM route WHERE route_id = $1 AND depot_id = $2",
    [routeId, depotId]
  );
  if (routeCheck.rowCount === 0)
    throw new Error("Route not found in this depot");

  await pool.query(
    "DELETE FROM route_stop WHERE route_id = $1 AND stop_order = $2",
    [routeId, stopOrder]
  );
  // Reorder remaining stops
  await pool.query(
    `UPDATE route_stop SET stop_order = stop_order - 1
         WHERE route_id = $1 AND stop_order > $2`,
    [routeId, stopOrder]
  );
  return true;
}

export async function reorderStops(routeId, newOrderMap, depotId) {
  // newOrderMap: array of { stop_order, new_order }
  // Simplified: delete all and reinsert (or use a transaction)
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Verify route ownership
    const routeCheck = await client.query(
      "SELECT 1 FROM route WHERE route_id = $1 AND depot_id = $2",
      [routeId, depotId]
    );
    if (routeCheck.rowCount === 0) throw new Error("Route not found");

    // Get existing stops
    const stops = await client.query(
      "SELECT stop_id FROM route_stop WHERE route_id = $1 ORDER BY stop_order",
      [routeId]
    );
    // Clear all
    await client.query("DELETE FROM route_stop WHERE route_id = $1", [routeId]);
    // Reinsert with new orders
    for (const [index, stop] of stops.rows.entries()) {
      await client.query(
        "INSERT INTO route_stop (route_id, stop_id, stop_order) VALUES ($1, $2, $3)",
        [routeId, stop.stop_id, index + 1]
      );
    }
    await client.query("COMMIT");
    return true;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export default {
  findByRoute,
  addStop,
  removeStop,
  reorderStops,
};
