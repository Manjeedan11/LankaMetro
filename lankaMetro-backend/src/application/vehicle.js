import vehicleRepository from "../infrastructure/repository/Vehicle.js";
import depotRepository from "../infrastructure/repository/Depot.js";
import ValidationError from "../domain/errors/validation-error.js";
import NotFoundError from "../domain/errors/not-found-error.js";

export const getVehicles = async (req, res, next) => {
  try {
    const { depotId } = req.query;
    const vehicles = await vehicleRepository.findAll(depotId || null);
    res.status(200).json(vehicles);
  } catch (err) {
    next(err);
  }
};

export const getVehicleById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const vehicle = await vehicleRepository.findById(id);
    if (!vehicle) throw new NotFoundError("Vehicle not found");
    res.status(200).json(vehicle);
  } catch (err) {
    next(err);
  }
};

export const createVehicle = async (req, res, next) => {
  try {
    const {
      plate_number,
      capacity,
      fuel_type,
      status = "ACTIVE",
      depot_id,
    } = req.body;

    if (!plate_number || !capacity || !fuel_type || !depot_id) {
      throw new ValidationError(
        "Missing required fields: plate_number, capacity, fuel_type, depot_id"
      );
    }

    // Check depot exists
    const depot = await depotRepository.findById(depot_id);
    if (!depot) throw new ValidationError("Depot not found");

    // Optional: check plate_number uniqueness (database has UNIQUE constraint)
    const newId = await vehicleRepository.create({
      plate_number,
      capacity,
      fuel_type,
      status,
      depot_id,
    });
    res.status(201).json({ message: "Vehicle created", vehicle_id: newId });
  } catch (err) {
    next(err);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;

    const existing = await vehicleRepository.findById(id);
    if (!existing) throw new NotFoundError("Vehicle not found");

    // If depot_id is being changed, verify new depot exists
    if (updates.depot_id) {
      const depot = await depotRepository.findById(updates.depot_id);
      if (!depot) throw new ValidationError("Target depot not found");
    }

    const success = await vehicleRepository.update(id, updates);
    if (!success) throw new NotFoundError("Vehicle not found or no changes");
    res.status(200).json({ message: "Vehicle updated" });
  } catch (err) {
    next(err);
  }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await vehicleRepository.findById(id);
    if (!existing) throw new NotFoundError("Vehicle not found");

    await vehicleRepository.deleteById(id);
    res.status(200).json({ message: "Vehicle retired (soft delete)" });
  } catch (err) {
    next(err);
  }
};

// For schedule creation – returns available vehicles for a given time slot
export const getAvailableVehicles = async (req, res, next) => {
  try {
    const { date, start, end } = req.query;
    const depotId = req.user.depotId; // from JWT (logistics officer)
    if (!date || !start || !end) {
      throw new ValidationError("date, start, end query parameters required");
    }
    const vehicles = await vehicleRepository.findAvailableVehicles(
      date,
      start,
      end,
      depotId
    );
    res.status(200).json(vehicles);
  } catch (err) {
    next(err);
  }
};
