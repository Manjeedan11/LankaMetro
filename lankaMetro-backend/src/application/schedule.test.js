import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSchedule } from "./schedule.js";
import ValidationError from "../domain/errors/validation-error.js";
import scheduleRepository from "../infrastructure/repository/Schedule.js";
import returnTripRepository from "../infrastructure/repository/ReturnTrip.js";
import routeRepository from "../infrastructure/repository/Route.js";
import vehicleRepository from "../infrastructure/repository/Vehicle.js";
import driverRepository from "../infrastructure/repository/Driver.js";
import { notifyDriver } from "./notificationService.js";

// Mock all dependencies
vi.mock("../infrastructure/repository/Schedule.js");
vi.mock("../infrastructure/repository/ReturnTrip.js");
vi.mock("../infrastructure/repository/Route.js");
vi.mock("../infrastructure/repository/Vehicle.js");
vi.mock("../infrastructure/repository/Driver.js");
vi.mock("./notificationService.js");

describe("createSchedule", () => {
  let req, res, next;

  beforeEach(() => {
    vi.resetAllMocks();

    req = {
      user: { depotId: 1, userId: 100, role: "logistics_officer" },
      body: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    next = vi.fn();
  });

  const setValidBody = () => {
    req.body = {
      route_id: 10,
      schedule_date: "2026-06-15",
      departure_time: "09:00",
      arrival_time: "11:00",
      vehicle_id: 5,
      driver_id: 2,
      generate_return: false,
    };
  };

  const mockSuccess = () => {
    routeRepository.findById.mockResolvedValue({
      route_id: 10,
      availability: "ACTIVE",
      route_name: "Colombo-Galle",
    });
    vehicleRepository.findById.mockResolvedValue({
      vehicle_id: 5,
      status: "ACTIVE",
    });
    driverRepository.findById.mockResolvedValue({
      driver_id: 2,
      availability: "AVAILABLE",
      license_expiry: "2030-01-01",
    });
    scheduleRepository.checkDriverOverlap.mockResolvedValue(false);
    scheduleRepository.checkVehicleOverlap.mockResolvedValue(false);
    scheduleRepository.checkExactDuplicate.mockResolvedValue(false);
    scheduleRepository.create.mockResolvedValue(123);
    notifyDriver.mockResolvedValue();
  };

  it("should throw ValidationError if required fields are missing", async () => {
    req.body = { route_id: 10 }; // missing others
    await createSchedule(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    expect(next.mock.calls[0][0].message).toBe("Missing required fields");
  });

  it("should throw ValidationError if route not found", async () => {
    setValidBody();
    routeRepository.findById.mockResolvedValue(null);
    await createSchedule(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    expect(next.mock.calls[0][0].message).toBe(
      "Route not found or not in your depot"
    );
  });

  it("should throw ValidationError if route is not active", async () => {
    setValidBody();
    routeRepository.findById.mockResolvedValue({
      route_id: 10,
      availability: "INACTIVE",
    });
    await createSchedule(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    expect(next.mock.calls[0][0].message).toBe("Route is not active");
  });

  it("should throw ValidationError if vehicle not found", async () => {
    setValidBody();
    routeRepository.findById.mockResolvedValue({
      route_id: 10,
      availability: "ACTIVE",
    });
    vehicleRepository.findById.mockResolvedValue(null);
    await createSchedule(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    expect(next.mock.calls[0][0].message).toBe("Vehicle not found");
  });

  it("should throw ValidationError if vehicle status is invalid (e.g., MAINTENANCE)", async () => {
    setValidBody();
    routeRepository.findById.mockResolvedValue({
      route_id: 10,
      availability: "ACTIVE",
    });
    vehicleRepository.findById.mockResolvedValue({
      vehicle_id: 5,
      status: "MAINTENANCE",
    });
    await createSchedule(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    expect(next.mock.calls[0][0].message).toContain("Vehicle is not available");
  });

  it("should throw ValidationError if driver not found", async () => {
    setValidBody();
    routeRepository.findById.mockResolvedValue({
      route_id: 10,
      availability: "ACTIVE",
    });
    vehicleRepository.findById.mockResolvedValue({
      vehicle_id: 5,
      status: "ACTIVE",
    });
    driverRepository.findById.mockResolvedValue(null);
    await createSchedule(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    expect(next.mock.calls[0][0].message).toBe("Driver not found");
  });

  it("should throw ValidationError if driver not available", async () => {
    setValidBody();
    routeRepository.findById.mockResolvedValue({
      route_id: 10,
      availability: "ACTIVE",
    });
    vehicleRepository.findById.mockResolvedValue({
      vehicle_id: 5,
      status: "ACTIVE",
    });
    driverRepository.findById.mockResolvedValue({
      driver_id: 2,
      availability: "ON_DUTY",
      license_expiry: "2030-01-01",
    });
    await createSchedule(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    expect(next.mock.calls[0][0].message).toBe("Driver is not available");
  });

  it("should throw ValidationError if driver license expired", async () => {
    setValidBody();
    routeRepository.findById.mockResolvedValue({
      route_id: 10,
      availability: "ACTIVE",
    });
    vehicleRepository.findById.mockResolvedValue({
      vehicle_id: 5,
      status: "ACTIVE",
    });
    driverRepository.findById.mockResolvedValue({
      driver_id: 2,
      availability: "AVAILABLE",
      license_expiry: "2020-01-01",
    });
    await createSchedule(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    expect(next.mock.calls[0][0].message).toBe("Driver license expired");
  });

  it("should throw ValidationError if driver has overlapping schedule", async () => {
    setValidBody();
    routeRepository.findById.mockResolvedValue({
      route_id: 10,
      availability: "ACTIVE",
    });
    vehicleRepository.findById.mockResolvedValue({
      vehicle_id: 5,
      status: "ACTIVE",
    });
    driverRepository.findById.mockResolvedValue({
      driver_id: 2,
      availability: "AVAILABLE",
      license_expiry: "2030-01-01",
    });
    scheduleRepository.checkDriverOverlap.mockResolvedValue(true);
    await createSchedule(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    expect(next.mock.calls[0][0].message).toBe(
      "Driver already has a schedule at this time"
    );
  });

  it("should throw ValidationError if vehicle has overlapping schedule", async () => {
    setValidBody();
    routeRepository.findById.mockResolvedValue({
      route_id: 10,
      availability: "ACTIVE",
    });
    vehicleRepository.findById.mockResolvedValue({
      vehicle_id: 5,
      status: "ACTIVE",
    });
    driverRepository.findById.mockResolvedValue({
      driver_id: 2,
      availability: "AVAILABLE",
      license_expiry: "2030-01-01",
    });
    scheduleRepository.checkDriverOverlap.mockResolvedValue(false);
    scheduleRepository.checkVehicleOverlap.mockResolvedValue(true);
    await createSchedule(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    expect(next.mock.calls[0][0].message).toBe(
      "Vehicle already has a schedule at this time"
    );
  });

  it("should throw ValidationError if exact duplicate exists", async () => {
    setValidBody();
    routeRepository.findById.mockResolvedValue({
      route_id: 10,
      availability: "ACTIVE",
    });
    vehicleRepository.findById.mockResolvedValue({
      vehicle_id: 5,
      status: "ACTIVE",
    });
    driverRepository.findById.mockResolvedValue({
      driver_id: 2,
      availability: "AVAILABLE",
      license_expiry: "2030-01-01",
    });
    scheduleRepository.checkDriverOverlap.mockResolvedValue(false);
    scheduleRepository.checkVehicleOverlap.mockResolvedValue(false);
    scheduleRepository.checkExactDuplicate.mockResolvedValue(true);
    await createSchedule(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    expect(next.mock.calls[0][0].message).toBe(
      "A schedule with the same route, date and time already exists."
    );
  });

  it("should create schedule successfully without return trip", async () => {
    setValidBody();
    mockSuccess();
    await createSchedule(req, res, next);
    expect(scheduleRepository.create).toHaveBeenCalledWith({
      schedule_date: "2026-06-15",
      departure_time: "09:00",
      arrival_time: "11:00",
      status: "SCHEDULED",
      route_id: 10,
      vehicle_id: 5,
      driver_id: 2,
      depot_id: 1,
    });
    expect(notifyDriver).toHaveBeenCalledWith(
      2,
      expect.stringContaining("New trip assigned"),
      "DRIVER_ASSIGNMENT"
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Schedule created",
      schedule_id: 123,
      return_trip_id: null,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should update vehicle status from PENDING to ACTIVE after schedule creation", async () => {
    setValidBody();
    routeRepository.findById.mockResolvedValue({
      route_id: 10,
      availability: "ACTIVE",
    });
    vehicleRepository.findById.mockResolvedValue({
      vehicle_id: 5,
      status: "PENDING",
    });
    driverRepository.findById.mockResolvedValue({
      driver_id: 2,
      availability: "AVAILABLE",
      license_expiry: "2030-01-01",
    });
    scheduleRepository.checkDriverOverlap.mockResolvedValue(false);
    scheduleRepository.checkVehicleOverlap.mockResolvedValue(false);
    scheduleRepository.checkExactDuplicate.mockResolvedValue(false);
    scheduleRepository.create.mockResolvedValue(123);
    notifyDriver.mockResolvedValue();
    vehicleRepository.update.mockResolvedValue(true);

    await createSchedule(req, res, next);
    expect(vehicleRepository.update).toHaveBeenCalledWith(5, {
      status: "ACTIVE",
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should create return trip with manually provided times", async () => {
    setValidBody();
    req.body.generate_return = true;
    req.body.return_departure_time = "14:00";
    req.body.return_arrival_time = "16:00";
    mockSuccess();
    scheduleRepository.checkDriverOverlap.mockResolvedValueOnce(false);
    scheduleRepository.checkVehicleOverlap.mockResolvedValueOnce(false);
    scheduleRepository.checkExactDuplicate.mockResolvedValue(false);
    scheduleRepository.checkDriverOverlap.mockResolvedValueOnce(false);
    scheduleRepository.checkVehicleOverlap.mockResolvedValueOnce(false);
    returnTripRepository.create.mockResolvedValue(456);

    await createSchedule(req, res, next);
    expect(returnTripRepository.create).toHaveBeenCalledWith({
      original_schedule_id: 123,
      departure_time: "14:00",
      arrival_time: "16:00",
      status: "SCHEDULED",
      return_route_id: 10,
    });
    expect(res.json).toHaveBeenCalledWith({
      message: "Schedule created",
      schedule_id: 123,
      return_trip_id: 456,
    });
  });

  it("should auto-calculate return departure/arrival times when not provided", async () => {
    setValidBody();
    req.body.generate_return = true;

    req.body.departure_time = "09:00";
    req.body.arrival_time = "11:00";
    mockSuccess();
    scheduleRepository.checkDriverOverlap.mockResolvedValueOnce(false);
    scheduleRepository.checkVehicleOverlap.mockResolvedValueOnce(false);
    scheduleRepository.checkExactDuplicate.mockResolvedValue(false);
    scheduleRepository.checkDriverOverlap.mockResolvedValueOnce(false);
    scheduleRepository.checkVehicleOverlap.mockResolvedValueOnce(false);
    returnTripRepository.create.mockResolvedValue(456);

    await createSchedule(req, res, next);
    expect(returnTripRepository.create).toHaveBeenCalledWith({
      original_schedule_id: 123,
      departure_time: "11:30:00",
      arrival_time: "13:30:00",
      status: "SCHEDULED",
      return_route_id: 10,
    });
  });

  it("should throw ValidationError if return trip overlaps with driver schedule", async () => {
    setValidBody();
    req.body.generate_return = true;
    mockSuccess();
    scheduleRepository.checkDriverOverlap.mockResolvedValueOnce(false);
    scheduleRepository.checkVehicleOverlap.mockResolvedValueOnce(false);
    scheduleRepository.checkExactDuplicate.mockResolvedValue(false);
    scheduleRepository.checkDriverOverlap.mockResolvedValueOnce(true);
    await createSchedule(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    expect(next.mock.calls[0][0].message).toBe(
      "Return trip would overlap with driver's existing schedule"
    );
  });
});
