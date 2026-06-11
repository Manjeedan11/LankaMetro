import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getMaintenanceRecords,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  completeMaintenance,
} from "./maintenance.js";
import ValidationError from "../domain/errors/validation-error.js";
import NotFoundError from "../domain/errors/not-found-error.js";
import maintenanceRepository from "../infrastructure/repository/Maintenance.js";
import vehicleRepository from "../infrastructure/repository/Vehicle.js";

vi.mock("../infrastructure/repository/Maintenance.js");
vi.mock("../infrastructure/repository/Vehicle.js");

describe("Maintenance Controller", () => {
  let req, res, next;

  beforeEach(() => {
    vi.resetAllMocks();
    req = {
      user: { userId: 1, role: "maintenance_officer" },
      params: {},
      query: {},
      body: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  // ========== getMaintenanceRecords ==========
  describe("getMaintenanceRecords", () => {
    it("should return all records when no filters", async () => {
      const mockRecords = [{ maintenance_id: 1, vehicle_id: 5 }];
      maintenanceRepository.findAll.mockResolvedValue(mockRecords);
      await getMaintenanceRecords(req, res, next);
      expect(maintenanceRepository.findAll).toHaveBeenCalledWith({
        vehicleId: undefined,
        status: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRecords);
    });

    it("should pass vehicleId and status filters to repository", async () => {
      req.query = { vehicleId: "5", status: "SCHEDULED" };
      await getMaintenanceRecords(req, res, next);
      expect(maintenanceRepository.findAll).toHaveBeenCalledWith({
        vehicleId: "5",
        status: "SCHEDULED",
      });
    });

    it("should call next on repository error", async () => {
      const error = new Error("DB error");
      maintenanceRepository.findAll.mockRejectedValue(error);
      await getMaintenanceRecords(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ========== getMaintenanceById ==========
  describe("getMaintenanceById", () => {
    it("should return record when found", async () => {
      req.params.id = "7";
      const mockRecord = { maintenance_id: 7, vehicle_id: 3 };
      maintenanceRepository.findById.mockResolvedValue(mockRecord);
      await getMaintenanceById(req, res, next);
      expect(maintenanceRepository.findById).toHaveBeenCalledWith(7);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRecord);
    });

    it("should throw NotFoundError when record not found", async () => {
      req.params.id = "99";
      maintenanceRepository.findById.mockResolvedValue(null);
      await getMaintenanceById(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(next.mock.calls[0][0].message).toBe(
        "Maintenance record not found"
      );
    });
  });

  // ========== createMaintenance ==========
  describe("createMaintenance", () => {
    const validBody = {
      vehicle_id: 5,
      type: "OIL_CHANGE",
      service_date: "2026-06-15",
      description: "Regular oil change",
      status: "SCHEDULED",
    };

    it("should throw ValidationError if vehicle_id missing", async () => {
      req.body = { ...validBody, vehicle_id: undefined };
      await createMaintenance(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toContain(
        "vehicle_id, type, and service_date are required"
      );
    });

    it("should throw ValidationError if type missing", async () => {
      req.body = { ...validBody, type: undefined };
      await createMaintenance(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it("should throw ValidationError if service_date missing", async () => {
      req.body = { ...validBody, service_date: undefined };
      await createMaintenance(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it("should throw ValidationError if vehicle not found", async () => {
      req.body = validBody;
      vehicleRepository.findById.mockResolvedValue(null);
      await createMaintenance(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toBe("Vehicle not found");
    });

    it("should create maintenance record with status SCHEDULED without changing vehicle status", async () => {
      req.body = validBody;
      vehicleRepository.findById.mockResolvedValue({
        vehicle_id: 5,
        status: "ACTIVE",
      });
      maintenanceRepository.create.mockResolvedValue(10);
      await createMaintenance(req, res, next);
      expect(maintenanceRepository.create).toHaveBeenCalledWith({
        vehicle_id: 5,
        type: "OIL_CHANGE",
        service_date: "2026-06-15",
        description: "Regular oil change",
        status: "SCHEDULED",
      });
      expect(vehicleRepository.updateStatus).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Maintenance record created",
        maintenance_id: 10,
      });
    });

    it("should update vehicle status to MAINTENANCE when record created as IN_PROGRESS", async () => {
      req.body = { ...validBody, status: "IN_PROGRESS" };
      vehicleRepository.findById.mockResolvedValue({
        vehicle_id: 5,
        status: "ACTIVE",
      });
      maintenanceRepository.create.mockResolvedValue(11);
      vehicleRepository.updateStatus.mockResolvedValue(true);
      await createMaintenance(req, res, next);
      expect(vehicleRepository.updateStatus).toHaveBeenCalledWith(
        5,
        "MAINTENANCE"
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  // ========== updateMaintenance ==========
  describe("updateMaintenance", () => {
    beforeEach(() => {
      req.params.id = "8";
      maintenanceRepository.findById.mockResolvedValue({
        maintenance_id: 8,
        vehicle_id: 5,
        status: "SCHEDULED",
      });
      maintenanceRepository.update.mockResolvedValue(true);
    });

    it("should throw NotFoundError if record not found", async () => {
      maintenanceRepository.findById.mockResolvedValue(null);
      await updateMaintenance(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it("should update vehicle to MAINTENANCE when status changes to IN_PROGRESS", async () => {
      // Only set the status, no extra fields
      req.body = { status: "IN_PROGRESS" };
      await updateMaintenance(req, res, next);
      expect(vehicleRepository.updateStatus).toHaveBeenCalledWith(
        5,
        "MAINTENANCE"
      );
      expect(maintenanceRepository.update).toHaveBeenCalledWith(8, {
        status: "IN_PROGRESS",
      });
    });

    it("should update vehicle to ACTIVE when status changes from IN_PROGRESS to COMPLETED", async () => {
      maintenanceRepository.findById.mockResolvedValue({
        maintenance_id: 8,
        vehicle_id: 5,
        status: "IN_PROGRESS",
      });
      req.body = { status: "COMPLETED" };
      await updateMaintenance(req, res, next);
      expect(vehicleRepository.updateStatus).toHaveBeenCalledWith(5, "ACTIVE");
      expect(maintenanceRepository.update).toHaveBeenCalledWith(8, {
        status: "COMPLETED",
      });
    });

    it("should not change vehicle status when status changes from IN_PROGRESS to SCHEDULED (revert)", async () => {
      maintenanceRepository.findById.mockResolvedValue({
        maintenance_id: 8,
        vehicle_id: 5,
        status: "IN_PROGRESS",
      });
      req.body = { status: "SCHEDULED" };
      await updateMaintenance(req, res, next);
      expect(vehicleRepository.updateStatus).not.toHaveBeenCalled();
      expect(maintenanceRepository.update).toHaveBeenCalledWith(8, {
        status: "SCHEDULED",
      });
    });

    it("should throw NotFoundError if update returns false", async () => {
      req.body = { description: "Updated description" };
      maintenanceRepository.update.mockResolvedValue(false);
      await updateMaintenance(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it("should update successfully without status change", async () => {
      req.body = { description: "Updated description" };
      await updateMaintenance(req, res, next);
      expect(maintenanceRepository.update).toHaveBeenCalledWith(8, {
        description: "Updated description",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Maintenance record updated",
      });
    });
  });

  // ========== deleteMaintenance ==========
  describe("deleteMaintenance", () => {
    beforeEach(() => {
      req.params.id = "9";
    });

    it("should throw NotFoundError if record not found", async () => {
      maintenanceRepository.findById.mockResolvedValue(null);
      await deleteMaintenance(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it("should throw ValidationError if record is IN_PROGRESS", async () => {
      maintenanceRepository.findById.mockResolvedValue({
        maintenance_id: 9,
        status: "IN_PROGRESS",
      });
      await deleteMaintenance(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toBe(
        "Cannot delete a maintenance record that is IN_PROGRESS. Complete it first."
      );
    });

    it("should delete SCHEDULED record successfully", async () => {
      maintenanceRepository.findById.mockResolvedValue({
        maintenance_id: 9,
        status: "SCHEDULED",
      });
      maintenanceRepository.deleteById.mockResolvedValue(true);
      await deleteMaintenance(req, res, next);
      expect(maintenanceRepository.deleteById).toHaveBeenCalledWith(9);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Maintenance record deleted",
      });
    });

    it("should delete COMPLETED record successfully", async () => {
      maintenanceRepository.findById.mockResolvedValue({
        maintenance_id: 9,
        status: "COMPLETED",
      });
      maintenanceRepository.deleteById.mockResolvedValue(true);
      await deleteMaintenance(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // ========== completeMaintenance ==========
  describe("completeMaintenance", () => {
    beforeEach(() => {
      req.params.id = "10";
      maintenanceRepository.findById.mockResolvedValue({
        maintenance_id: 10,
        vehicle_id: 5,
        status: "IN_PROGRESS",
      });
      maintenanceRepository.update.mockResolvedValue(true);
      vehicleRepository.updateStatus.mockResolvedValue(true);
    });

    it("should throw NotFoundError if record not found", async () => {
      maintenanceRepository.findById.mockResolvedValue(null);
      await completeMaintenance(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it("should throw ValidationError if record is not IN_PROGRESS", async () => {
      maintenanceRepository.findById.mockResolvedValue({
        maintenance_id: 10,
        status: "SCHEDULED",
      });
      await completeMaintenance(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toBe(
        "Only maintenance records IN_PROGRESS can be completed"
      );
    });

    it("should complete maintenance and reactivate vehicle", async () => {
      await completeMaintenance(req, res, next);
      expect(maintenanceRepository.update).toHaveBeenCalledWith(10, {
        status: "COMPLETED",
      });
      expect(vehicleRepository.updateStatus).toHaveBeenCalledWith(5, "ACTIVE");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Maintenance completed, vehicle reactivated",
      });
    });
  });
});
