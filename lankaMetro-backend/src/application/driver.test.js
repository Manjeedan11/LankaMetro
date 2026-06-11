import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getDrivers,
  getDriverById,
  getMyDriverInfo,
  updateDriver,
  updateDriverAvailability,
  getAvailableDrivers,
} from "./driver.js";
import ValidationError from "../domain/errors/validation-error.js";
import NotFoundError from "../domain/errors/not-found-error.js";
import driverRepository from "../infrastructure/repository/Driver.js";
import userRepository from "../infrastructure/repository/User.js";

vi.mock("../infrastructure/repository/Driver.js");
vi.mock("../infrastructure/repository/User.js");

describe("Driver Controller", () => {
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

    // Explicitly mock all driverRepository methods to avoid undefined
    driverRepository.findAll = vi.fn();
    driverRepository.findById = vi.fn();
    driverRepository.findByUserId = vi.fn();
    driverRepository.update = vi.fn();
    driverRepository.updateAvailability = vi.fn();
    driverRepository.findAvailableDrivers = vi.fn();
  });

  // ========== getDrivers ==========
  describe("getDrivers", () => {
    it("should return all drivers for the depot", async () => {
      const mockDrivers = [{ driver_id: 1, full_name: "John Driver" }];
      driverRepository.findAll.mockResolvedValue(mockDrivers);
      await getDrivers(req, res, next);
      expect(driverRepository.findAll).toHaveBeenCalledWith(10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockDrivers);
    });

    it("should call next with error if repository fails", async () => {
      const error = new Error("DB error");
      driverRepository.findAll.mockRejectedValue(error);
      await getDrivers(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ========== getDriverById ==========
  describe("getDriverById", () => {
    it("should return driver when found", async () => {
      req.params.id = "5";
      const mockDriver = { driver_id: 5, full_name: "Jane" };
      driverRepository.findById.mockResolvedValue(mockDriver);
      await getDriverById(req, res, next);
      expect(driverRepository.findById).toHaveBeenCalledWith(5, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockDriver);
    });

    it("should throw NotFoundError when driver not found", async () => {
      req.params.id = "99";
      driverRepository.findById.mockResolvedValue(null);
      await getDriverById(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(next.mock.calls[0][0].message).toBe("Driver not found");
    });
  });

  // ========== getMyDriverInfo ==========
  describe("getMyDriverInfo", () => {
    it("should return driver info for the logged-in driver", async () => {
      const mockDriver = {
        driver_id: 2,
        user_id: 1,
        license_number: "LIC123",
        license_expiry: "2030-01-01",
        availability: "AVAILABLE",
      };
      const mockUser = { full_name: "Self Driver" };
      driverRepository.findByUserId.mockResolvedValue(mockDriver);
      userRepository.findById.mockResolvedValue(mockUser);
      await getMyDriverInfo(req, res, next);
      expect(driverRepository.findByUserId).toHaveBeenCalledWith(1);
      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        driver_id: 2,
        full_name: "Self Driver",
        license_number: "LIC123",
        license_expiry: "2030-01-01",
        availability: "AVAILABLE",
      });
    });

    it("should throw NotFoundError if driver record not found", async () => {
      driverRepository.findByUserId.mockResolvedValue(null);
      await getMyDriverInfo(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(next.mock.calls[0][0].message).toBe("Driver record not found");
    });
  });

  // ========== updateDriver ==========
  describe("updateDriver", () => {
    beforeEach(() => {
      req.params.id = "5";
      req.body = { phone_number: "0712345678" };
    });

    it("should throw NotFoundError if driver not found", async () => {
      driverRepository.findById.mockResolvedValue(null);
      await updateDriver(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it("should return 403 if non-admin tries to update another driver", async () => {
      req.user.role = "logistics_officer";
      driverRepository.findById.mockResolvedValue({
        driver_id: 5,
        user_id: 2,
      });
      await updateDriver(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Forbidden: You can only update your own driver record",
      });
    });

    it("should allow driver to update their own record (non-admin)", async () => {
      req.user.role = "driver";
      req.user.userId = 2;
      driverRepository.findById.mockResolvedValue({
        driver_id: 5,
        user_id: 2,
      });
      driverRepository.update.mockResolvedValue(true);
      await updateDriver(req, res, next);
      expect(driverRepository.update).toHaveBeenCalledWith(
        5,
        10,
        { phone_number: "0712345678" },
        false
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should allow admin to update any driver and keep license fields", async () => {
      req.user.role = "admin";
      req.body = { license_number: "NEW123", license_expiry: "2032-12-31" };
      driverRepository.findById.mockResolvedValue({
        driver_id: 5,
        user_id: 2,
      });
      driverRepository.update.mockResolvedValue(true);
      await updateDriver(req, res, next);
      expect(driverRepository.update).toHaveBeenCalledWith(
        5,
        10,
        { license_number: "NEW123", license_expiry: "2032-12-31" },
        true
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should delete license fields for non-admin update (even if provided)", async () => {
      req.user.role = "driver";
      req.user.userId = 2;
      req.body = { license_number: "SHOULDBEDELETED", phone_number: "123" };
      driverRepository.findById.mockResolvedValue({
        driver_id: 5,
        user_id: 2,
      });
      driverRepository.update.mockResolvedValue(true);
      await updateDriver(req, res, next);
      expect(driverRepository.update).toHaveBeenCalledWith(
        5,
        10,
        { phone_number: "123" },
        false
      );
    });

    it("should throw ValidationError if license_expiry is invalid or past date", async () => {
      req.user.role = "admin";
      req.body = { license_expiry: "2020-01-01" };
      driverRepository.findById.mockResolvedValue({ driver_id: 5, user_id: 2 });
      await updateDriver(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toBe(
        "License expiry must be a future date"
      );
    });
  });

  // ========== updateDriverAvailability ==========
  describe("updateDriverAvailability", () => {
    beforeEach(() => {
      req.params.id = "5";
      req.body = { availability: "OFF_DUTY" };
      driverRepository.findById.mockResolvedValue({
        driver_id: 5,
        user_id: 2,
      });
      driverRepository.updateAvailability.mockResolvedValue(true);
    });

    it("should throw ValidationError if availability missing", async () => {
      req.body = {};
      await updateDriverAvailability(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toBe("availability is required");
    });

    it("should throw NotFoundError if driver not found", async () => {
      driverRepository.findById.mockResolvedValue(null);
      await updateDriverAvailability(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it("should return 403 if non-admin tries to update another driver", async () => {
      req.user.role = "logistics_officer";
      req.user.userId = 1;
      await updateDriverAvailability(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
    });

    it("should allow driver to update their own availability", async () => {
      req.user.role = "driver";
      req.user.userId = 2;
      await updateDriverAvailability(req, res, next);
      expect(driverRepository.updateAvailability).toHaveBeenCalledWith(
        5,
        "OFF_DUTY",
        10
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Availability updated",
      });
    });

    it("should throw ValidationError for invalid availability value", async () => {
      // Make the user the driver themselves (self) to pass permission check
      req.user.role = "driver";
      req.user.userId = 2;
      req.body.availability = "INVALID";
      await updateDriverAvailability(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toContain("Invalid availability");
    });
  });

  // ========== getAvailableDrivers ==========
  describe("getAvailableDrivers", () => {
    it("should throw ValidationError if date, start, or end missing", async () => {
      req.query = { date: "2026-06-15", start: "09:00" };
      await getAvailableDrivers(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toBe(
        "date, start, end query parameters required"
      );
    });

    it("should return available drivers when all parameters provided", async () => {
      req.query = { date: "2026-06-15", start: "09:00", end: "11:00" };
      const mockDrivers = [{ driver_id: 1, full_name: "John" }];
      driverRepository.findAvailableDrivers.mockResolvedValue(mockDrivers);
      await getAvailableDrivers(req, res, next);
      expect(driverRepository.findAvailableDrivers).toHaveBeenCalledWith(
        "2026-06-15",
        "09:00",
        "11:00",
        10
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockDrivers);
    });
  });
});
