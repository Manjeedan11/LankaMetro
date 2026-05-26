import routeStopRepository from "../infrastructure/repository/RouteStop.js";
import routeRepository from "../infrastructure/repository/Route.js";
import stopRepository from "../infrastructure/repository/Stop.js";
import ValidationError from "../domain/errors/validation-error.js";
import NotFoundError from "../domain/errors/not-found-error.js";

export const getRouteStops = async (req, res, next) => {
  try {
    const routeId = parseInt(req.params.routeId);
    const depotId = req.user.depotId;
    const route = await routeRepository.findById(routeId, depotId);
    if (!route) throw new NotFoundError("Route not found");
    const stops = await routeStopRepository.findByRoute(routeId, depotId);
    res.status(200).json(stops);
  } catch (err) {
    next(err);
  }
};

export const addStopToRoute = async (req, res, next) => {
  try {
    const routeId = parseInt(req.params.routeId);
    const { stop_id, stop_order } = req.body;
    const depotId = req.user.depotId;
    if (!stop_id || stop_order === undefined)
      throw new ValidationError("stop_id and stop_order required");

    // Verify stop belongs to same depot
    const stop = await stopRepository.findById(stop_id, depotId);
    if (!stop) throw new ValidationError("Stop not found in this depot");

    const route = await routeRepository.findById(routeId, depotId);
    if (!route) throw new NotFoundError("Route not found");

    const newId = await routeStopRepository.addStop(
      routeId,
      stop_id,
      stop_order,
      depotId
    );
    res
      .status(201)
      .json({ message: "Stop added to route", route_stop_id: newId });
  } catch (err) {
    next(err);
  }
};

export const removeStopFromRoute = async (req, res, next) => {
  try {
    const routeId = parseInt(req.params.routeId);
    const { stop_order } = req.body;
    const depotId = req.user.depotId;
    if (stop_order === undefined)
      throw new ValidationError("stop_order required");

    const route = await routeRepository.findById(routeId, depotId);
    if (!route) throw new NotFoundError("Route not found");

    await routeStopRepository.removeStop(routeId, stop_order, depotId);
    res.status(200).json({ message: "Stop removed from route" });
  } catch (err) {
    next(err);
  }
};

export const reorderRouteStops = async (req, res, next) => {
  try {
    const routeId = parseInt(req.params.routeId);
    const { newOrder } = req.body; // array of { stop_order, new_order }
    const depotId = req.user.depotId;
    if (!newOrder || !Array.isArray(newOrder))
      throw new ValidationError("newOrder array required");

    const route = await routeRepository.findById(routeId, depotId);
    if (!route) throw new NotFoundError("Route not found");

    await routeStopRepository.reorderStops(routeId, newOrder, depotId);
    res.status(200).json({ message: "Stops reordered" });
  } catch (err) {
    next(err);
  }
};
