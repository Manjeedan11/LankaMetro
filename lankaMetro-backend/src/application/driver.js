import driverRepository from "../infrastructure/repository/Driver.js";
import userRepository from "../infrastructure/repository/User.js";
import notificationRepository from "../infrastructure/repository/Notification.js";
import ValidationError from "../domain/errors/validation-error.js";
import NotFoundError from "../domain/errors/not-found-error.js";

export const getDrivers = async (req, res, next) => {
  try {
    const depotId = req.user.depotId;
    const drivers = await driverRepository.findAll(depotId);
    res.status(200).json(drivers);
  } catch (error) {
    next(error);
  }
};

export const getDriverById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const depotId = req.user.depotId;
    const driver = await driverRepository.findById(id, depotId);
    if (!driver) throw new NotFoundError("Driver not found");
    res.status(200).json(driver);
  } catch (error) {
    next(error);
  }
};

export const getMyDriverInfo = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const driver = await driverRepository.findByUserId(userId);
    if (!driver) throw new NotFoundError("Driver record not found");
    const user = await userRepository.findById(userId); // if needed
    res.status(200).json({
      driver_id: driver.driver_id,
      full_name: user.full_name,
      license_number: driver.license_number,
      license_expiry: driver.license_expiry,
      availability: driver.availability,
    });
  } catch (err) {
    next(err);
  }
};

export const updateDriver = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const depotId = req.user.depotId;
    const updates = req.body;
    const isAdmin = req.user.role === "admin";

    const existing = await driverRepository.findById(id, depotId, isAdmin);
    if (!existing) throw new NotFoundError("Driver not found");

    const isSelf = existing.user_id === req.user.userId;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        message: "Forbidden: You can only update your own driver record",
      });
    }

    if (!isAdmin) {
      delete updates.license_number;
      delete updates.license_expiry;
    }

    if (updates.license_expiry) {
      const expiryDate = new Date(updates.license_expiry);
      if (isNaN(expiryDate) || expiryDate <= new Date()) {
        throw new ValidationError("License expiry must be a future date");
      }
    }

    const success = await driverRepository.update(
      id,
      depotId,
      updates,
      isAdmin
    );
    if (!success) throw new NotFoundError("Driver not found or no changes");
    res.status(200).json({ message: "Driver updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateDriverAvailability = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { availability } = req.body;
    const depotId = req.user.depotId;

    if (!availability) throw new ValidationError("availability is required");

    const existing = await driverRepository.findById(id, depotId);
    if (!existing) throw new NotFoundError("Driver not found");

    const isAdmin = req.user.role === "admin";
    const isSelf = existing.user_id === req.user.userId;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const allowedStatuses = [
      "AVAILABLE",
      "ON_DUTY",
      "OFF_DUTY",
      "SICK",
      "LEAVE",
    ];
    if (!allowedStatuses.includes(availability)) {
      throw new ValidationError(
        `Invalid availability. Allowed: ${allowedStatuses.join(", ")}`
      );
    }

    const success = await driverRepository.updateAvailability(
      id,
      availability,
      depotId
    );
    if (!success) throw new NotFoundError("Driver not found");
    res.status(200).json({ message: "Availability updated" });
  } catch (error) {
    next(error);
  }
};

export const getAvailableDrivers = async (req, res, next) => {
  try {
    const { date, start, end } = req.query;
    if (!date || !start || !end) {
      throw new ValidationError("date, start, end query parameters required");
    }
    const depotId = req.user.depotId;
    const drivers = await driverRepository.findAvailableDrivers(
      date,
      start,
      end,
      depotId
    );
    res.status(200).json(drivers);
  } catch (error) {
    next(error);
  }
};

export const requestSuddenTripForDriver = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const depotId = req.user.depotId;

    const driver = await driverRepository.findById(id, depotId);
    if (!driver) throw new NotFoundError("Driver not found");

    if (driver.availability !== "AVAILABLE") {
      throw new ValidationError(
        "Only available drivers can be requested for sudden trips"
      );
    }

    const logisticsUsers = await userRepository.findByRoleAndDepot(
      "logistics_officer",
      depotId
    );
    for (const user of logisticsUsers) {
      await notificationRepository.create({
        user_id: user.user_id,
        message: `🚨 Sudden trip request for driver ${driver.full_name} (ID: ${driver.driver_id}). Please assign a schedule.`,
        type: "SUDDEN_TRIP",
        driver_id: null,
      });
    }

    res.status(200).json({
      message: "Sudden trip request sent. Logistics officer notified.",
    });
  } catch (err) {
    next(err);
  }
};
