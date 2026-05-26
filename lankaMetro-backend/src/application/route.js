import routeRepository from "../infrastructure/repository/Route.js";
import depotRepository from "../infrastructure/repository/Depot.js";
import ValidationError from "../domain/errors/validation-error.js";
import NotFoundError from "../domain/errors/not-found-error.js";

export const getRoutes = async (req, res, next) => {
  try {
    const depotId = req.user.depotId;
    const routes = await routeRepository.findAll(depotId);
    res.status(200).json(routes);
  } catch (error) {
    next(error);
  }
};

export const getRouteById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const depotId = req.user.depotId;
    const route = await routeRepository.findById(id, depotId);
    if (!route) {
      throw new NotFoundError("Route not found");
    }
    res.status(200).json(route);
  } catch (error) {
    next(error);
  }
};

export const createRoute = async (req, res, next) => {
  try {
    const {
      route_no,
      route_name,
      start_point,
      destination,
      distance_txt,
      subroute_info,
      availability = "ACTIVE",
    } = req.body;
    const depotId = req.user.depotId;

    if (
      !route_no ||
      !route_name ||
      !start_point ||
      !destination ||
      !distance_txt
    ) {
      throw new ValidationError(
        "Missing required fields: route_no, route_name, start_point, destination, distance_txt"
      );
    }

    // Check if route_no already exists in this depot
    const existing = await routeRepository.findByRouteNo(route_no, depotId);
    if (existing) {
      throw new ValidationError("Route number already exists in this depot");
    }

    const newId = await routeRepository.create({
      route_no,
      route_name,
      start_point,
      destination,
      distance_txt,
      subroute_info: subroute_info || null,
      availability,
      depot_id: depotId,
    });

    res
      .status(201)
      .json({ message: "Route created successfully", route_id: newId });
  } catch (error) {
    next(error);
  }
};

export const updateRoute = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const depotId = req.user.depotId;
    const updates = req.body;

    const existing = await routeRepository.findById(id, depotId);
    if (!existing) {
      throw new NotFoundError("Route not found");
    }

    // If route_no is being changed, check uniqueness
    if (updates.route_no && updates.route_no !== existing.route_no) {
      const duplicate = await routeRepository.findByRouteNo(
        updates.route_no,
        depotId
      );
      if (duplicate) {
        throw new ValidationError("Route number already exists in this depot");
      }
    }

    const success = await routeRepository.update(id, depotId, updates);
    if (!success) {
      throw new NotFoundError("Route not found or no changes");
    }

    res.status(200).json({ message: "Route updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteRoute = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const depotId = req.user.depotId;
    const existing = await routeRepository.findById(id, depotId);
    if (!existing) {
      throw new NotFoundError("Route not found");
    }

    const success = await routeRepository.deleteById(id, depotId);
    if (!success) {
      throw new NotFoundError("Route not found");
    }
    res.status(200).json({ message: "Route disabled successfully" });
  } catch (error) {
    next(error);
  }
};
