import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getDepots,
  getDepotById,
  createDepot,
  updateDepot,
  deleteDepot,
} from "./depot.js";
import ValidationError from "../domain/errors/validation-error.js";
import NotFoundError from "../domain/errors/not-found-error.js";
import depotRepository from "../infrastructure/repository/Depot.js";
import { logAction } from "../infrastructure/logging.js";

vi.mock("../infrastructure/repository/Depot.js");
vi.mock("../infrastructure/logging.js");

describe("Depot Controller", () => {
  let req, res, next;

  beforeEach(() => {
    vi.resetAllMocks();
    req = {
      user: { userId: 1, role: "admin" },
      params: {},
      body: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    logAction.mockResolvedValue();
  });

  // ========== getDepots ==========
  describe("getDepots", () => {
    it("should return all depots", async () => {
      const mockDepots = [{ depot_id: 1, depot_name: "Colombo Depot" }];
      depotRepository.findAll.mockResolvedValue(mockDepots);
      await getDepots(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockDepots);
    });

    it("should call next with error if repository fails", async () => {
      const error = new Error("DB error");
      depotRepository.findAll.mockRejectedValue(error);
      await getDepots(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ========== getDepotById ==========
  describe("getDepotById", () => {
    it("should return depot when found", async () => {
      req.params.id = "5";
      const mockDepot = { depot_id: 5, depot_name: "Kandy Depot" };
      depotRepository.findById.mockResolvedValue(mockDepot);
      await getDepotById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockDepot);
    });

    it("should throw NotFoundError when depot not found", async () => {
      req.params.id = "99";
      depotRepository.findById.mockResolvedValue(null);
      await getDepotById(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(next.mock.calls[0][0].message).toBe("Depot not found");
    });
  });

  // ========== createDepot ==========
  describe("createDepot - Validation Errors", () => {
    const validBody = {
      depot_name: "Galle Depot",
      location: "Galle, Sri Lanka",
      contact_number: "0912345678",
      status: "ACTIVE",
      latitude: "6.032",
      longitude: "80.217",
    };

    it("should throw ValidationError when depot_name missing", async () => {
      req.body = { ...validBody, depot_name: undefined };
      await createDepot(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toContain(
        "Missing required fields"
      );
    });

    it("should throw ValidationError when location missing", async () => {
      req.body = { ...validBody, location: undefined };
      await createDepot(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it("should throw ValidationError when contact_number missing", async () => {
      req.body = { ...validBody, contact_number: undefined };
      await createDepot(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it("should create depot successfully with all fields", async () => {
      req.body = validBody;
      depotRepository.create.mockResolvedValue(10);
      await createDepot(req, res, next);

      expect(depotRepository.create).toHaveBeenCalledWith({
        depot_name: "Galle Depot",
        location: "Galle, Sri Lanka",
        contact_number: "0912345678",
        status: "ACTIVE",
        latitude: 6.032,
        longitude: 80.217,
      });
      expect(logAction).toHaveBeenCalledWith(
        req.user,
        "Create Depot",
        `Depot name: Galle Depot, ID=10`,
        10
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Depot created successfully",
        depot_id: 10,
      });
    });

    it("should create depot with default status ACTIVE and null coordinates if not provided", async () => {
      req.body = {
        depot_name: "Negombo Depot",
        location: "Negombo",
        contact_number: "0311234567",
      };
      depotRepository.create.mockResolvedValue(11);
      await createDepot(req, res, next);

      expect(depotRepository.create).toHaveBeenCalledWith({
        depot_name: "Negombo Depot",
        location: "Negombo",
        contact_number: "0311234567",
        status: "ACTIVE",
        latitude: null,
        longitude: null,
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  // ========== updateDepot ==========
  describe("updateDepot", () => {
    beforeEach(() => {
      req.params.id = "5";
      req.body = { depot_name: "Updated Depot Name" };
      depotRepository.findById.mockResolvedValue({
        depot_id: 5,
        depot_name: "Old Name",
      });
      depotRepository.update.mockResolvedValue(true);
    });

    it("should throw NotFoundError if depot not found", async () => {
      depotRepository.findById.mockResolvedValue(null);
      await updateDepot(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it("should parse latitude and longitude to numbers if provided", async () => {
      req.body = { latitude: "6.5", longitude: "80.1" };
      depotRepository.update.mockResolvedValue(true);
      await updateDepot(req, res, next);
      expect(depotRepository.update).toHaveBeenCalledWith(5, {
        latitude: 6.5,
        longitude: 80.1,
      });
    });

    it("should throw NotFoundError if update fails (no changes)", async () => {
      depotRepository.update.mockResolvedValue(false);
      await updateDepot(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(next.mock.calls[0][0].message).toBe(
        "Depot not found or no changes"
      );
    });

    it("should update depot successfully", async () => {
      await updateDepot(req, res, next);
      expect(depotRepository.update).toHaveBeenCalledWith(5, {
        depot_name: "Updated Depot Name",
      });
      expect(logAction).toHaveBeenCalledWith(
        req.user,
        "Update Depot",
        expect.stringContaining("Depot ID=5"),
        5
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Depot updated successfully",
      });
    });
  });

  // ========== deleteDepot (disable) ==========
  describe("deleteDepot", () => {
    beforeEach(() => {
      req.params.id = "5";
      depotRepository.findById.mockResolvedValue({
        depot_id: 5,
        depot_name: "Depot to Disable",
      });
      depotRepository.disable.mockResolvedValue(true);
    });

    it("should throw NotFoundError if depot not found", async () => {
      depotRepository.findById.mockResolvedValue(null);
      await deleteDepot(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it("should throw NotFoundError if disable fails", async () => {
      depotRepository.disable.mockResolvedValue(false);
      await deleteDepot(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it("should disable depot successfully", async () => {
      await deleteDepot(req, res, next);
      expect(depotRepository.disable).toHaveBeenCalledWith(5);
      expect(logAction).toHaveBeenCalledWith(
        req.user,
        "Disable Depot",
        `Depot ID=5, name=Depot to Disable`,
        5
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Depot disabled successfully",
      });
    });
  });
});
