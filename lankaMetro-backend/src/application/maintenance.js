import maintenanceRepository from "../infrastructure/repository/Maintenance.js";
import vehicleRepository from "../infrastructure/repository/Vehicle.js";
import ValidationError from "../domain/errors/validation-error.js";
import NotFoundError from "../domain/errors/not-found-error.js";

export const getMaintenanceRecords = async (req, res, next) => {
  try {
    const { vehicleId, status } = req.query;
    const records = await maintenanceRepository.findAll({ vehicleId, status });
    res.status(200).json(records);
  } catch (err) {
    next(err);
  }
};

export const getMaintenanceById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const record = await maintenanceRepository.findById(id);
    if (!record) throw new NotFoundError("Maintenance record not found");
    res.status(200).json(record);
  } catch (err) {
    next(err);
  }
};

export const createMaintenance = async (req, res, next) => {
  try {
    const {
      vehicle_id,
      type,
      service_date,
      description,
      status = "SCHEDULED",
    } = req.body;
    if (!vehicle_id || !type || !service_date) {
      throw new ValidationError(
        "vehicle_id, type, and service_date are required"
      );
    }

    // Verify vehicle exists
    const vehicle = await vehicleRepository.findById(vehicle_id);
    if (!vehicle) throw new ValidationError("Vehicle not found");

    const newId = await maintenanceRepository.create({
      vehicle_id,
      type,
      service_date,
      description,
      status,
    });

    // If status is 'IN_PROGRESS', mark vehicle as 'MAINTENANCE'
    if (status === "IN_PROGRESS") {
      await vehicleRepository.updateStatus(vehicle_id, "MAINTENANCE");
    }

    res
      .status(201)
      .json({ message: "Maintenance record created", maintenance_id: newId });
  } catch (err) {
    next(err);
  }
};

export const updateMaintenance = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;

    const existing = await maintenanceRepository.findById(id);
    if (!existing) throw new NotFoundError("Maintenance record not found");

    // If status is changing to/from 'IN_PROGRESS', update vehicle status accordingly
    const newStatus = updates.status;
    const oldStatus = existing.status;

    if (newStatus === "IN_PROGRESS" && oldStatus !== "IN_PROGRESS") {
      await vehicleRepository.updateStatus(existing.vehicle_id, "MAINTENANCE");
    } else if (newStatus === "COMPLETED" && oldStatus === "IN_PROGRESS") {
      await vehicleRepository.updateStatus(existing.vehicle_id, "ACTIVE");
    } else if (newStatus === "SCHEDULED" && oldStatus === "IN_PROGRESS") {
      // Reverting from IN_PROGRESS to SCHEDULED – should vehicle become active? Usually not, but we decide:
      // We'll keep vehicle as MAINTENANCE until COMPLETED. So no change.
    }

    const success = await maintenanceRepository.update(id, updates);
    if (!success)
      throw new NotFoundError("Maintenance record not found or no changes");
    res.status(200).json({ message: "Maintenance record updated" });
  } catch (err) {
    next(err);
  }
};

export const deleteMaintenance = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await maintenanceRepository.findById(id);
    if (!existing) throw new NotFoundError("Maintenance record not found");

    // If this record was IN_PROGRESS, revert vehicle to ACTIVE? Risky.
    // We'll only allow deletion of SCHEDULED or COMPLETED records.
    if (existing.status === "IN_PROGRESS") {
      throw new ValidationError(
        "Cannot delete a maintenance record that is IN_PROGRESS. Complete it first."
      );
    }

    await maintenanceRepository.deleteById(id);
    res.status(200).json({ message: "Maintenance record deleted" });
  } catch (err) {
    next(err);
  }
};

// For the "Complete Maintenance" button – a dedicated endpoint
export const completeMaintenance = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await maintenanceRepository.findById(id);
    if (!existing) throw new NotFoundError("Maintenance record not found");
    if (existing.status !== "IN_PROGRESS") {
      throw new ValidationError(
        "Only maintenance records IN_PROGRESS can be completed"
      );
    }
    // Update maintenance status to COMPLETED
    await maintenanceRepository.update(id, { status: "COMPLETED" });
    // Reactivate vehicle
    await vehicleRepository.updateStatus(existing.vehicle_id, "ACTIVE");
    res
      .status(200)
      .json({ message: "Maintenance completed, vehicle reactivated" });
  } catch (err) {
    next(err);
  }
};
