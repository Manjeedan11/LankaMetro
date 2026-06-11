import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "./user.js";
import ValidationError from "../domain/errors/validation-error.js";
import NotFoundError from "../domain/errors/not-found-error.js";
import userRepository from "../infrastructure/repository/User.js";
import depotRepository from "../infrastructure/repository/Depot.js";
import driverRepository from "../infrastructure/repository/Driver.js";
import { sendCredentials } from "../infrastructure/email.js";

vi.mock("bcryptjs");
vi.mock("../infrastructure/repository/User.js");
vi.mock("../infrastructure/repository/Depot.js");
vi.mock("../infrastructure/repository/Driver.js");
vi.mock("../infrastructure/email.js");

describe("User Controller", () => {
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

    bcrypt.hash.mockResolvedValue("hashed_password");
    sendCredentials.mockResolvedValue();
  });

  // ========== getUsers ==========
  describe("getUsers", () => {
    it("should return all users", async () => {
      const mockUsers = [{ user_id: 1, full_name: "Admin User" }];
      userRepository.findAll.mockResolvedValue(mockUsers);
      await getUsers(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it("should call next with error if repository fails", async () => {
      const error = new Error("DB error");
      userRepository.findAll.mockRejectedValue(error);
      await getUsers(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ========== getUserById ==========
  describe("getUserById", () => {
    it("should return user when found", async () => {
      req.params.id = "5";
      userRepository.findById.mockResolvedValue({
        user_id: 5,
        full_name: "John",
      });
      await getUserById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should throw NotFoundError when user not found", async () => {
      req.params.id = "99";
      userRepository.findById.mockResolvedValue(null);
      await getUserById(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });
  });

  // ========== createUser – Validation Errors ==========
  describe("createUser - Validation Errors", () => {
    const validBody = {
      full_name: "John Driver",
      email: "john@example.com",
      password: "Pass123",
      role: "driver",
      phone_number: "0712345678",
      depot_id: 1,
      status: "ACTIVE",
    };

    it("should throw ValidationError when full_name missing", async () => {
      req.body = { ...validBody, full_name: undefined };
      await createUser(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it("should throw ValidationError when email missing", async () => {
      req.body = { ...validBody, email: undefined };
      await createUser(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it("should throw ValidationError when password missing", async () => {
      req.body = { ...validBody, password: undefined };
      await createUser(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it("should throw ValidationError when role missing", async () => {
      req.body = { ...validBody, role: undefined };
      await createUser(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it("should throw ValidationError for invalid role", async () => {
      req.body = { ...validBody, role: "invalid_role" };
      await createUser(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it("should throw ValidationError if non-admin user missing depot_id", async () => {
      req.body = { ...validBody, depot_id: undefined };
      await createUser(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it("should throw ValidationError if depot not found", async () => {
      req.body = validBody;
      depotRepository.findById.mockResolvedValue(null);
      await createUser(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it("should throw ValidationError if admin has depot_id", async () => {
      req.body = { ...validBody, role: "admin", depot_id: 1 };
      await createUser(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it("should throw ValidationError if email already exists", async () => {
      req.body = validBody;
      depotRepository.findById.mockResolvedValue({ depot_id: 1 });
      userRepository.findByEmail.mockResolvedValue({ user_id: 99 });
      await createUser(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it("should create driver successfully and also create driver record", async () => {
      req.body = validBody;
      depotRepository.findById.mockResolvedValue({ depot_id: 1 });
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(10);
      driverRepository.create.mockResolvedValue();

      await createUser(req, res, next);

      expect(userRepository.create).toHaveBeenCalledWith({
        full_name: "John Driver",
        email: "john@example.com",
        password_hash: "hashed_password",
        role: "driver",
        phone_number: "0712345678",
        depot_id: 1,
        status: "ACTIVE",
      });
      expect(driverRepository.create).toHaveBeenCalled();
      expect(sendCredentials).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should create non-driver user without driver record", async () => {
      req.body = { ...validBody, role: "logistics_officer" };
      depotRepository.findById.mockResolvedValue({ depot_id: 1 });
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(11);

      await createUser(req, res, next);

      expect(driverRepository.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  // ========== updateUser – Validation Errors ==========
  describe("updateUser - Validation Errors", () => {
    beforeEach(() => {
      req.params.id = "5";
      req.body = {};
      userRepository.findById.mockResolvedValue({
        user_id: 5,
        role: "driver",
        email: "old@example.com",
      });
    });

    it("should throw NotFoundError if user not found", async () => {
      userRepository.findById.mockResolvedValue(null);
      await updateUser(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it("should hash password if provided", async () => {
      req.body = { password: "newpass" };
      userRepository.update.mockResolvedValue(true);
      await updateUser(req, res, next);
      expect(bcrypt.hash).toHaveBeenCalledWith("newpass", 10);
      expect(userRepository.update).toHaveBeenCalledWith(5, {
        password_hash: "hashed_password",
      });
    });

    it("should throw ValidationError for invalid role in update", async () => {
      req.body = { role: "invalid" };
      await updateUser(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it("should throw ValidationError when assigning depot to admin", async () => {
      userRepository.findById.mockResolvedValue({ user_id: 5, role: "admin" });
      req.body = { depot_id: 1 };
      await updateUser(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it("should throw ValidationError if depot not found", async () => {
      req.body = { depot_id: 999 };
      depotRepository.findById.mockResolvedValue(null);
      await updateUser(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it("should throw ValidationError if email already exists", async () => {
      req.body = { email: "taken@example.com" };
      userRepository.findByEmail.mockResolvedValue({ user_id: 99 });
      await updateUser(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it("should create driver record when updating from non-driver to driver", async () => {
      userRepository.findById.mockResolvedValue({
        user_id: 5,
        role: "logistics_officer",
      });
      req.body = { role: "driver" };
      userRepository.update.mockResolvedValue(true);
      driverRepository.create.mockResolvedValue();
      await updateUser(req, res, next);
      expect(driverRepository.create).toHaveBeenCalled();
    });

    it("should delete driver record when updating from driver to non-driver", async () => {
      userRepository.findById.mockResolvedValue({ user_id: 5, role: "driver" });
      req.body = { role: "logistics_officer" };
      userRepository.update.mockResolvedValue(true);
      driverRepository.deleteByUserId.mockResolvedValue();
      await updateUser(req, res, next);
      expect(driverRepository.deleteByUserId).toHaveBeenCalledWith(5);
    });

    it("should update user successfully without role change", async () => {
      req.body = { full_name: "Updated Name" };
      userRepository.update.mockResolvedValue(true);
      await updateUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "User updated successfully",
      });
    });
  });

  // ========== deleteUser – FIXED ==========
  describe("deleteUser - Validation Errors", () => {
    beforeEach(() => {
      // Ensure a mock `delete` method exists (the controller calls userRepository.delete)
      userRepository.delete = vi.fn();
    });

    it("should throw NotFoundError if user not found", async () => {
      req.params.id = "5";
      userRepository.findById.mockResolvedValue(null);
      await deleteUser(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it("should throw ValidationError when trying to delete the only admin", async () => {
      req.params.id = "1";
      userRepository.findById.mockResolvedValue({ user_id: 1, role: "admin" });
      userRepository.countByRole.mockResolvedValue(1);
      await deleteUser(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toBe(
        "Cannot delete the only admin user"
      );
    });

    it("should delete non-admin user successfully", async () => {
      req.params.id = "5";
      userRepository.findById.mockResolvedValue({ user_id: 5, role: "driver" });
      userRepository.delete.mockResolvedValue(true);
      await deleteUser(req, res, next);
      expect(userRepository.delete).toHaveBeenCalledWith(5);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "User disabled successfully",
      });
    });

    it("should delete admin user when there are multiple admins", async () => {
      req.params.id = "1";
      userRepository.findById.mockResolvedValue({ user_id: 1, role: "admin" });
      userRepository.countByRole.mockResolvedValue(2);
      userRepository.delete.mockResolvedValue(true);
      await deleteUser(req, res, next);
      expect(userRepository.delete).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
