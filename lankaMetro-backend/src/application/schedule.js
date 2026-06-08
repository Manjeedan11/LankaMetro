import scheduleRepository from "../infrastructure/repository/Schedule.js";
import returnTripRepository from "../infrastructure/repository/ReturnTrip.js";
import routeRepository from "../infrastructure/repository/Route.js";
import vehicleRepository from "../infrastructure/repository/Vehicle.js";
import driverRepository from "../infrastructure/repository/Driver.js";
import ValidationError from "../domain/errors/validation-error.js";
import NotFoundError from "../domain/errors/not-found-error.js";
import { notifyDriver } from "./notificationService.js";

export const getSchedules = async (req, res, next) => {
  try {
    const depotId = req.user.depotId;
    const { date } = req.query;
    const schedules = await scheduleRepository.findAll(depotId, date);
    res.status(200).json(schedules);
  } catch (err) {
    next(err);
  }
};

export const getScheduleById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const depotId = req.user.depotId;
    const schedule = await scheduleRepository.findById(id, depotId);
    if (!schedule) throw new NotFoundError("Schedule not found");
    const returnTrip = await returnTripRepository.findByOriginalScheduleId(id);
    res.status(200).json({ ...schedule, returnTrip });
  } catch (err) {
    next(err);
  }
};

export const createSchedule = async (req, res, next) => {
  try {
    const {
      route_id,
      schedule_date,
      departure_time,
      arrival_time,
      vehicle_id,
      driver_id,
      generate_return = false,
      return_departure_time,
      return_arrival_time,
    } = req.body;
    const depotId = req.user.depotId;

    // Basic validation
    if (
      !route_id ||
      !schedule_date ||
      !departure_time ||
      !arrival_time ||
      !vehicle_id ||
      !driver_id
    ) {
      throw new ValidationError("Missing required fields");
    }

    // 1. Validate route exists and is active
    const route = await routeRepository.findById(route_id, depotId);
    if (!route)
      throw new ValidationError("Route not found or not in your depot");
    if (route.availability !== "ACTIVE")
      throw new ValidationError("Route is not active");

    // 2. Validate vehicle – allow ACTIVE or PENDING (from sudden trip)
    const vehicle = await vehicleRepository.findById(vehicle_id);
    if (!vehicle) throw new ValidationError("Vehicle not found");
    if (vehicle.status !== "ACTIVE" && vehicle.status !== "PENDING") {
      throw new ValidationError(
        "Vehicle is not available (maintenance/retired or already scheduled)"
      );
    }

    // 3. Validate driver availability and license
    const driver = await driverRepository.findById(driver_id, depotId);
    if (!driver) throw new ValidationError("Driver not found");
    if (driver.availability !== "AVAILABLE")
      throw new ValidationError("Driver is not available");
    if (new Date(driver.license_expiry) <= new Date())
      throw new ValidationError("Driver license expired");

    // 4. Check overlaps
    const driverOverlap = await scheduleRepository.checkDriverOverlap(
      driver_id,
      schedule_date,
      departure_time,
      arrival_time
    );
    if (driverOverlap)
      throw new ValidationError("Driver already has a schedule at this time");

    const vehicleOverlap = await scheduleRepository.checkVehicleOverlap(
      vehicle_id,
      schedule_date,
      departure_time,
      arrival_time
    );
    if (vehicleOverlap)
      throw new ValidationError("Vehicle already has a schedule at this time");

    // Checking for exact duplicate schedule
    const duplicate = await scheduleRepository.checkExactDuplicate(
      route_id,
      schedule_date,
      departure_time,
      arrival_time
    );
    if (duplicate) {
      throw new ValidationError(
        "A schedule with the same route, date and time already exists."
      );
    }

    // 5. Create schedule
    const scheduleId = await scheduleRepository.create({
      schedule_date,
      departure_time,
      arrival_time,
      status: "SCHEDULED",
      route_id,
      vehicle_id,
      driver_id,
      depot_id: depotId,
    });

    // 6. If vehicle was PENDING (from sudden trip), set it back to ACTIVE
    if (vehicle.status === "PENDING") {
      await vehicleRepository.update(vehicle_id, { status: "ACTIVE" });
    }

    // 7. Generate return trip if requested
    let returnTripId = null;
    if (generate_return) {
      let return_departure_time_calc, return_arrival_time_calc;

      if (return_departure_time && return_arrival_time) {
        return_departure_time_calc = return_departure_time;
        return_arrival_time_calc = return_arrival_time;
      } else {
        // Auto-calculate: rest = 30 minutes after forward arrival
        const REST_MINUTES = 30;
        const [arrHour, arrMin] = arrival_time.split(":").map(Number);
        const [depHour, depMin] = departure_time.split(":").map(Number);
        const forwardDurationMinutes =
          arrHour * 60 + arrMin - (depHour * 60 + depMin);
        let returnDepTotalMinutes = arrHour * 60 + arrMin + REST_MINUTES;
        let returnDepHour = Math.floor(returnDepTotalMinutes / 60);
        let returnDepMin = returnDepTotalMinutes % 60;
        if (returnDepHour >= 24) {
          throw new ValidationError(
            "Return trip would cross midnight; please adjust manually."
          );
        }
        return_departure_time_calc = `${returnDepHour
          .toString()
          .padStart(2, "0")}:${returnDepMin.toString().padStart(2, "0")}:00`;
        let returnArrTotalMinutes =
          returnDepTotalMinutes + forwardDurationMinutes;
        let returnArrHour = Math.floor(returnArrTotalMinutes / 60);
        let returnArrMin = returnArrTotalMinutes % 60;
        if (returnArrHour >= 24) {
          throw new ValidationError(
            "Return trip would cross midnight; please adjust manually."
          );
        }
        return_arrival_time_calc = `${returnArrHour
          .toString()
          .padStart(2, "0")}:${returnArrMin.toString().padStart(2, "0")}:00`;
      }

      // Validate return trip overlaps
      const returnDriverOverlap = await scheduleRepository.checkDriverOverlap(
        driver_id,
        schedule_date,
        return_departure_time_calc,
        return_arrival_time_calc
      );
      if (returnDriverOverlap)
        throw new ValidationError(
          "Return trip would overlap with driver's existing schedule"
        );

      const returnVehicleOverlap = await scheduleRepository.checkVehicleOverlap(
        vehicle_id,
        schedule_date,
        return_departure_time_calc,
        return_arrival_time_calc
      );
      if (returnVehicleOverlap)
        throw new ValidationError(
          "Return trip would overlap with vehicle's existing schedule"
        );

      returnTripId = await returnTripRepository.create({
        original_schedule_id: scheduleId,
        departure_time: return_departure_time_calc,
        arrival_time: return_arrival_time_calc,
        status: "SCHEDULED",
        return_route_id: route_id,
      });
    }

    // 8. Notify the driver
    await notifyDriver(
      driver_id,
      `🚍 New trip assigned: ${route.route_name} on ${schedule_date} at ${departure_time}`,
      "DRIVER_ASSIGNMENT"
    );

    res.status(201).json({
      message: "Schedule created",
      schedule_id: scheduleId,
      return_trip_id: returnTripId,
    });
  } catch (err) {
    next(err);
  }
};

export const updateSchedule = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const depotId = req.user.depotId;
    const updates = req.body;

    const existing = await scheduleRepository.findById(id, depotId);
    if (!existing) throw new NotFoundError("Schedule not found");

    if (
      updates.driver_id ||
      updates.vehicle_id ||
      updates.schedule_date ||
      updates.departure_time ||
      updates.arrival_time
    ) {
      const newDriverId = updates.driver_id ?? existing.driver_id;
      const newVehicleId = updates.vehicle_id ?? existing.vehicle_id;
      const newDate = updates.schedule_date ?? existing.schedule_date;
      const newDeparture = updates.departure_time ?? existing.departure_time;
      const newArrival = updates.arrival_time ?? existing.arrival_time;

      const driverOverlap = await scheduleRepository.checkDriverOverlap(
        newDriverId,
        newDate,
        newDeparture,
        newArrival,
        id
      );
      if (driverOverlap)
        throw new ValidationError("Driver would have a schedule conflict");
      const vehicleOverlap = await scheduleRepository.checkVehicleOverlap(
        newVehicleId,
        newDate,
        newDeparture,
        newArrival,
        id
      );
      if (vehicleOverlap)
        throw new ValidationError("Vehicle would have a schedule conflict");
    }

    if (
      updates.departure_time ||
      updates.arrival_time ||
      updates.route_id ||
      updates.schedule_date
    ) {
      const newRouteId = updates.route_id ?? existing.route_id;
      const newDate = updates.schedule_date ?? existing.schedule_date;
      const newDeparture = updates.departure_time ?? existing.departure_time;
      const newArrival = updates.arrival_time ?? existing.arrival_time;
      const duplicate = await scheduleRepository.checkExactDuplicate(
        newRouteId,
        newDate,
        newDeparture,
        newArrival,
        id
      );
      if (duplicate) {
        throw new ValidationError(
          "Another schedule with the same route, date and time already exists."
        );
      }
    }

    const success = await scheduleRepository.update(id, depotId, updates);
    if (!success) throw new NotFoundError("Schedule not found or no changes");
    res.status(200).json({ message: "Schedule updated" });
  } catch (err) {
    next(err);
  }
};

export const cancelSchedule = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const depotId = req.user.depotId;
    const existing = await scheduleRepository.findById(id, depotId);
    if (!existing) throw new NotFoundError("Schedule not found");

    const success = await scheduleRepository.cancel(id, depotId);
    if (!success) throw new NotFoundError("Schedule not found");
    res.status(200).json({ message: "Schedule cancelled" });
  } catch (err) {
    next(err);
  }
};

export const updateScheduleStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const depotId = req.user.depotId;
    const userRole = req.user.role;

    if (!status) throw new ValidationError("Status is required");

    const schedule = await scheduleRepository.findById(id, depotId);
    if (!schedule) throw new NotFoundError("Schedule not found");

    if (userRole === "driver") {
      const driver = await driverRepository.findByUserId(req.user.userId);
      if (!driver || schedule.driver_id !== driver.driver_id) {
        throw new ValidationError("You can only update your own trips");
      }
    }

    await scheduleRepository.update(id, depotId, { status });

    if (status === "IN_PROGRESS") {
      await driverRepository.updateAvailability(
        schedule.driver_id,
        "ON_DUTY",
        depotId
      );
    }

    if (status === "COMPLETED") {
      const remaining = await scheduleRepository.countRemainingToday(
        schedule.driver_id,
        schedule.schedule_date,
        id
      );
      if (remaining === 0) {
        await driverRepository.updateAvailability(
          schedule.driver_id,
          "AVAILABLE",
          depotId
        );
      }
    }

    res.status(200).json({ message: "Schedule status updated" });
  } catch (err) {
    next(err);
  }
};

export const getMySchedules = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const driver = await driverRepository.findByUserId(userId);
    if (!driver) throw new NotFoundError("Driver not found");

    const today = new Date().toISOString().split("T")[0];

    // 1. Get forward trips (regular schedules)
    const forwardTrips = await scheduleRepository.findByDriverAndDate(
      driver.driver_id,
      today
    );

    // 2. Get return trips (from return_trip table)
    const returnTrips = await returnTripRepository.findByDriverAndDate(
      driver.driver_id,
      today
    );

    // 3. Merge and sort by departure time
    const allTrips = [...forwardTrips, ...returnTrips].sort((a, b) =>
      a.departure_time.localeCompare(b.departure_time)
    );

    res.status(200).json(allTrips);
  } catch (err) {
    next(err);
  }
};

export const getMyHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const driver = await driverRepository.findByUserId(userId);
    if (!driver) throw new NotFoundError("Driver not found");
    const schedules = await scheduleRepository.findByDriver(driver.driver_id);
    res.status(200).json(schedules);
  } catch (err) {
    next(err);
  }
};
