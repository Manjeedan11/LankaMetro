import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getAvailableVehicles,
  requestSuddenTrip,
} from "./vehicle.js";
import ValidationError from "../domain/errors/validation-error.js";
import NotFoundError from "../domain/errors/not-found-error.js";
import vehicleRepository from "../infrastructure/repository/Vehicle.js";
import depotRepository from "../infrastructure/repository/Depot.js";
import notificationRepository from "../infrastructure/repository/Notification.js";
import userRepository from "../infrastructure/repository/User.js";

vi.mock("../infrastructure/repository/Vehicle.js");
vi.mock("../infrastructure/repository/Depot.js");
vi.mock("../infrastructure/repository/Notification.js");
vi.mock("../infrastructure/repository/User.js");

describe("Vehicle Controller", () => {
  let req, res, next;

  beforeEach(() => {
    vi.resetAllMocks();
    req = {
      user: { userId: 1, role: "logistics_officer", depotId: 10 },
      params: {},
      query: {},
      body: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();

    // Ensure repository methods are defined
    vehicleRepository.findAll = vi.fn();
    vehicleRepository.findById = vi.fn();
    vehicleRepository.create = vi.fn();
    vehicleRepository.update = vi.fn();
    vehicleRepository.deleteById = vi.fn();
    vehicleRepository.findAvailableVehicles = vi.fn();
    depotRepository.findById = vi.fn();
    notificationRepository.create = vi.fn();
    userRepository.findByRoleAndDepot = vi.fn();
  });

  // ========== getVehicles ==========
  describe("getVehicles", () => {
    it("should return all vehicles (no depot filter)", async () => {
      const mockVehicles = [{ vehicle_id: 1, plate_number: "ABC-123" }];
      vehicleRepository.findAll.mockResolvedValue(mockVehicles);
      await getVehicles(req, res, next);
      expect(vehicleRepository.findAll).toHaveBeenCalledWith(null);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockVehicles);
    });

    it("should filter by depotId if provided", async () => {
      req.query.depotId = "5";
      await getVehicles(req, res, next);
      expect(vehicleRepository.findAll).toHaveBeenCalledWith("5");
    });

    it("should call next on repository error", async () => {
      const error = new Error("DB error");
      vehicleRepository.findAll.mockRejectedValue(error);
      await getVehicles(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ========== getVehicleById ==========
  describe("getVehicleById", () => {
    it("should return vehicle when found", async () => {
      req.params.id = "7";
      const mockVehicle = { vehicle_id: 7, plate_number: "XYZ-789" };
      vehicleRepository.findById.mockResolvedValue(mockVehicle);
      await getVehicleById(req, res, next);
      expect(vehicleRepository.findById).toHaveBeenCalledWith(7);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockVehicle);
    });

    it("should throw NotFoundError when vehicle not found", async () => {
      req.params.id = "99";
      vehicleRepository.findById.mockResolvedValue(null);
      await getVehicleById(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(next.mock.calls[0][0].message).toBe("Vehicle not found");
    });
  });

  // ========== createVehicle ==========
  describe("createVehicle", () => {
    const validBody = {
      plate_number: "ABC-123",
      capacity: 40,
      fuel_type: "Diesel",
      status: "ACTIVE",
      depot_id: 5,
    };

    it("should throw ValidationError if required fields missing", async () => {
      req.body = { plate_number: "ABC-123" };
      await createVehicle(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toContain(
        "Missing required fields"
      );
    });

    it("should throw ValidationError if depot not found", async () => {
      req.body = validBody;
      depotRepository.findById.mockResolvedValue(null);
      await createVehicle(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toBe("Depot not found");
    });

    it("should create vehicle successfully", async () => {
      req.body = validBody;
      depotRepository.findById.mockResolvedValue({
        depot_id: 5,
        name: "Colombo",
      });
      vehicleRepository.create.mockResolvedValue(10);
      await createVehicle(req, res, next);
      expect(vehicleRepository.create).toHaveBeenCalledWith({
        plate_number: "ABC-123",
        capacity: 40,
        fuel_type: "Diesel",
        status: "ACTIVE",
        depot_id: 5,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Vehicle created",
        vehicle_id: 10,
      });
    });

    it("should default status to ACTIVE if not provided", async () => {
      const { status, ...bodyWithoutStatus } = validBody;
      req.body = bodyWithoutStatus;
      depotRepository.findById.mockResolvedValue({ depot_id: 5 });
      vehicleRepository.create.mockResolvedValue(11);
      await createVehicle(req, res, next);
      expect(vehicleRepository.create).toHaveBeenCalledWith({
        plate_number: "ABC-123",
        capacity: 40,
        fuel_type: "Diesel",
        status: "ACTIVE",
        depot_id: 5,
      });
    });
  });

  // ========== updateVehicle ==========
  describe("updateVehicle", () => {
    beforeEach(() => {
      req.params.id = "8";
      req.body = { capacity: 50 };
    });

    it("should throw NotFoundError if vehicle not found", async () => {
      vehicleRepository.findById.mockResolvedValue(null);
      await updateVehicle(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it("should throw ValidationError if new depot not found", async () => {
      vehicleRepository.findById.mockResolvedValue({
        vehicle_id: 8,
        depot_id: 5,
      });
      req.body.depot_id = 99;
      depotRepository.findById.mockResolvedValue(null);
      await updateVehicle(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toBe("Target depot not found");
    });

    it("should update vehicle successfully", async () => {
      vehicleRepository.findById.mockResolvedValue({ vehicle_id: 8 });
      vehicleRepository.update.mockResolvedValue(true);
      await updateVehicle(req, res, next);
      expect(vehicleRepository.update).toHaveBeenCalledWith(8, {
        capacity: 50,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Vehicle updated" });
    });

    it("should throw NotFoundError if update returns false", async () => {
      vehicleRepository.findById.mockResolvedValue({ vehicle_id: 8 });
      vehicleRepository.update.mockResolvedValue(false);
      await updateVehicle(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(next.mock.calls[0][0].message).toBe(
        "Vehicle not found or no changes"
      );
    });
  });

  // ========== deleteVehicle ==========
  describe("deleteVehicle", () => {
    beforeEach(() => {
      req.params.id = "9";
    });

    it("should throw NotFoundError if vehicle not found", async () => {
      vehicleRepository.findById.mockResolvedValue(null);
      await deleteVehicle(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it("should soft delete vehicle successfully", async () => {
      vehicleRepository.findById.mockResolvedValue({ vehicle_id: 9 });
      vehicleRepository.deleteById.mockResolvedValue(true);
      await deleteVehicle(req, res, next);
      expect(vehicleRepository.deleteById).toHaveBeenCalledWith(9);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Vehicle retired (soft delete)",
      });
    });
  });

  // ========== getAvailableVehicles ==========
  describe("getAvailableVehicles", () => {
    it("should throw ValidationError if date, start, or end missing", async () => {
      req.query = { date: "2026-06-15", start: "09:00" };
      await getAvailableVehicles(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toBe(
        "date, start, end query parameters required"
      );
    });

    it("should return available vehicles with all parameters", async () => {
      req.query = { date: "2026-06-15", start: "09:00", end: "11:00" };
      const mockVehicles = [{ vehicle_id: 1, plate_number: "ABC" }];
      vehicleRepository.findAvailableVehicles.mockResolvedValue(mockVehicles);
      await getAvailableVehicles(req, res, next);
      expect(vehicleRepository.findAvailableVehicles).toHaveBeenCalledWith(
        "2026-06-15",
        "09:00",
        "11:00",
        10
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockVehicles);
    });
  });

  // ========== requestSuddenTrip ==========
  describe("requestSuddenTrip", () => {
    beforeEach(() => {
      req.params.id = "10";
      req.user.depotId = 5;
    });

    it("should throw NotFoundError if vehicle not found", async () => {
      vehicleRepository.findById.mockResolvedValue(null);
      await requestSuddenTrip(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it("should throw ValidationError if vehicle not ACTIVE", async () => {
      vehicleRepository.findById.mockResolvedValue({
        vehicle_id: 10,
        status: "MAINTENANCE",
      });
      await requestSuddenTrip(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toBe(
        "Only active vehicles can be requested for sudden trips"
      );
    });

    it("should update vehicle to PENDING and create notifications for logistics officers", async () => {
      const mockVehicle = {
        vehicle_id: 10,
        plate_number: "NU-8091",
        status: "ACTIVE",
      };
      const mockLogisticsUsers = [
        { user_id: 101, full_name: "Log1" },
        { user_id: 102, full_name: "Log2" },
      ];
      vehicleRepository.findById.mockResolvedValue(mockVehicle);
      vehicleRepository.update.mockResolvedValue(true);
      userRepository.findByRoleAndDepot.mockResolvedValue(mockLogisticsUsers);
      notificationRepository.create.mockResolvedValue();

      await requestSuddenTrip(req, res, next);

      expect(vehicleRepository.update).toHaveBeenCalledWith(10, {
        status: "PENDING",
      });
      expect(userRepository.findByRoleAndDepot).toHaveBeenCalledWith(
        "logistics_officer",
        5
      );
      expect(notificationRepository.create).toHaveBeenCalledTimes(2);
      expect(notificationRepository.create).toHaveBeenCalledWith({
        user_id: 101,
        message: expect.stringContaining("NU-8091"),
        type: "SUDDEN_TRIP",
        driver_id: null,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Sudden trip request sent. Logistics officer notified.",
      });
    });

    it("should handle case when no logistics officers exist (no notifications created)", async () => {
      vehicleRepository.findById.mockResolvedValue({
        vehicle_id: 10,
        plate_number: "BUS-01",
        status: "ACTIVE",
      });
      userRepository.findByRoleAndDepot.mockResolvedValue([]);
      vehicleRepository.update.mockResolvedValue(true);
      await requestSuddenTrip(req, res, next);
      expect(notificationRepository.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
