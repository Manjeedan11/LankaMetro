import bcrypt from "bcryptjs";
import userRepository from "../infrastructure/repository/User.js";
import depotRepository from "../infrastructure/repository/Depot.js";
import driverRepository from "../infrastructure/repository/Driver.js";
import { sendCredentials } from "../infrastructure/email.js";
import ValidationError from "../domain/errors/validation-error.js";
import NotFoundError from "../domain/errors/not-found-error.js";

const ALLOWED_ROLES = [
  "admin",
  "depot_supervisor",
  "logistics_officer",
  "maintenance_officer",
  "driver",
];
const SALT_ROUNDS = 10;

export const getUsers = async (req, res, next) => {
  try {
    const users = await userRepository.findAll();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const {
      full_name,
      email,
      password,
      role,
      phone_number,
      depot_id,
      status = "ACTIVE",
    } = req.body;

    if (!full_name || !email || !password || !role) {
      throw new ValidationError(
        "Missing required fields: full_name, email, password, role"
      );
    }

    if (!ALLOWED_ROLES.includes(role)) {
      throw new ValidationError(
        `Invalid role. Allowed: ${ALLOWED_ROLES.join(", ")}`
      );
    }

    if (role !== "admin") {
      if (!depot_id) {
        throw new ValidationError("depot_id is required for non‑admin users");
      }
      const depot = await depotRepository.findById(depot_id);
      if (!depot) {
        throw new ValidationError("Depot not found");
      }
    } else {
      if (depot_id) {
        throw new ValidationError("Admin cannot be assigned to a depot");
      }
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ValidationError("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const userId = await userRepository.create({
      full_name,
      email,
      password_hash: hashedPassword,
      role,
      phone_number,
      depot_id: role === "admin" ? null : depot_id,
      status,
    });

    if (role === "driver") {
      await driverRepository.create({
        user_id: userId,
        license_number: "PENDING",
        license_expiry: "2099-12-31",
        availability: "AVAILABLE",
        depot_id: depot_id,
      });
    }

    sendCredentials(email, full_name, password, role).catch((err) =>
      console.error("Email error:", err)
    );

    res
      .status(201)
      .json({ message: "User created successfully", user_id: userId });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;

    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError("User not found");
    }

    if (updates.password) {
      updates.password_hash = await bcrypt.hash(updates.password, SALT_ROUNDS);
      delete updates.password;
    }

    if (updates.role && !ALLOWED_ROLES.includes(updates.role)) {
      throw new ValidationError(
        `Invalid role. Allowed: ${ALLOWED_ROLES.join(", ")}`
      );
    }

    if (updates.depot_id !== undefined) {
      if (updates.role === "admin" || existingUser.role === "admin") {
        throw new ValidationError("Admin cannot be assigned to a depot");
      }
      if (updates.depot_id) {
        const depot = await depotRepository.findById(updates.depot_id);
        if (!depot) {
          throw new ValidationError("Depot not found");
        }
      }
    }

    if (updates.email && updates.email !== existingUser.email) {
      const emailExists = await userRepository.findByEmail(updates.email);
      if (emailExists) {
        throw new ValidationError("Email already exists");
      }
    }

    const success = await userRepository.update(id, updates);
    if (!success) {
      throw new NotFoundError("User not found or update failed");
    }

    if (updates.role === "driver" && existingUser.role !== "driver") {
      await driverRepository.create({
        user_id: id,
        license_number: "PENDING",
        license_expiry: "2099-12-31",
        availability: "AVAILABLE",
        depot_id: updates.depot_id ?? existingUser.depot_id,
      });
    } else if (updates.role !== "driver" && existingUser.role === "driver") {
      await driverRepository.deleteByUserId(id);
    }

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.role === "admin") {
      const adminCount = await userRepository.countByRole("admin");
      if (adminCount === 1) {
        throw new ValidationError("Cannot delete the only admin user");
      }
    }

    const success = await userRepository.delete(id);
    if (!success) {
      throw new NotFoundError("User not found");
    }
    res.status(200).json({ message: "User disabled successfully" });
  } catch (error) {
    next(error);
  }
};
