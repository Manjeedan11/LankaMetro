import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
} from "./route.js";
import ValidationError from "../domain/errors/validation-error.js";
import NotFoundError from "../domain/errors/not-found-error.js";
import routeRepository from "../infrastructure/repository/Route.js";

// Mock the repository
vi.mock("../infrastructure/repository/Route.js");

describe("Route Controller", () => {
  let req, res, next;

  beforeEach(() => {
    vi.resetAllMocks();
    req = {
      user: { depotId: 1 },
      params: {},
      body: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  // ========== getRoutes ==========
  describe("getRoutes", () => {
    it("should return all routes for the depot", async () => {
      const mockRoutes = [{ route_id: 1, route_name: "Colombo-Galle" }];
      routeRepository.findAll.mockResolvedValue(mockRoutes);
      await getRoutes(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRoutes);
    });

    it("should call next with error if repository fails", async () => {
      const error = new Error("DB error");
      routeRepository.findAll.mockRejectedValue(error);
      await getRoutes(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ========== getRouteById ==========
  describe("getRouteById", () => {
    it("should return route when found", async () => {
      req.params.id = "5";
      routeRepository.findById.mockResolvedValue({ route_id: 5 });
      await getRouteById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should throw NotFoundError when route not found", async () => {
      req.params.id = "99";
      routeRepository.findById.mockResolvedValue(null);
      await getRouteById(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });
  });

  // ========== createRoute – Validation Errors ==========
  describe("createRoute - Validation Errors", () => {
    const validBody = {
      route_no: "R101",
      route_name: "Colombo-Galle",
      start_point: "Colombo",
      destination: "Galle",
      distance_txt: "115 km",
    };

    it("should throw ValidationError when route_no missing", async () => {
      req.body = { ...validBody, route_no: undefined };
      await createRoute(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toContain(
        "Missing required fields"
      );
    });

    it("should throw ValidationError when route_name missing", async () => {
      req.body = { ...validBody, route_name: undefined };
      await createRoute(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it("should throw ValidationError when start_point missing", async () => {
      req.body = { ...validBody, start_point: undefined };
      await createRoute(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it("should throw ValidationError when destination missing", async () => {
      req.body = { ...validBody, destination: undefined };
      await createRoute(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it("should throw ValidationError when distance_txt missing", async () => {
      req.body = { ...validBody, distance_txt: undefined };
      await createRoute(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it("should throw ValidationError if route number already exists", async () => {
      req.body = validBody;
      routeRepository.findByRouteNo.mockResolvedValue({ route_id: 99 });
      await createRoute(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toBe(
        "Route number already exists in this depot"
      );
    });

    it("should create route successfully when all fields valid", async () => {
      req.body = validBody;
      routeRepository.findByRouteNo.mockResolvedValue(null);
      routeRepository.create.mockResolvedValue(10);
      await createRoute(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Route created successfully",
        route_id: 10,
      });
    });
  });

  // ========== updateRoute ==========
  describe("updateRoute - Validation Errors", () => {
    beforeEach(() => {
      req.params.id = "5";
      req.body = { route_name: "Updated" };
    });

    it("should throw NotFoundError if route not found", async () => {
      routeRepository.findById.mockResolvedValue(null);
      await updateRoute(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it("should throw ValidationError if new route_no already exists", async () => {
      routeRepository.findById.mockResolvedValue({
        route_id: 5,
        route_no: "R101",
      });
      req.body.route_no = "R202";
      routeRepository.findByRouteNo.mockResolvedValue({ route_id: 8 });
      await updateRoute(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toBe(
        "Route number already exists in this depot"
      );
    });

    it("should update successfully", async () => {
      routeRepository.findById.mockResolvedValue({
        route_id: 5,
        route_no: "R101",
      });
      routeRepository.update.mockResolvedValue(true);
      await updateRoute(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // ========== deleteRoute ==========
  describe("deleteRoute", () => {
    beforeEach(() => {
      req.params.id = "5";
    });

    it("should throw NotFoundError if route not found", async () => {
      routeRepository.findById.mockResolvedValue(null);
      await deleteRoute(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it("should delete successfully", async () => {
      routeRepository.findById.mockResolvedValue({ route_id: 5 });
      routeRepository.deleteById.mockResolvedValue(true);
      await deleteRoute(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Route disabled successfully",
      });
    });
  });
});
