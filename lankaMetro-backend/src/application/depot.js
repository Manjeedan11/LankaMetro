import depotRepository from "../infrastructure/repository/Depot.js";
import ValidationError from "../domain/errors/validation-error.js";
import NotFoundError from "../domain/errors/not-found-error.js";
import { logAction } from "../infrastructure/logging.js";

export const getDepots = async (req, res, next) => {
  try {
    const depots = await depotRepository.findAll();
    res.status(200).json(depots);
  } catch (error) {
    next(error);
  }
};

export const getDepotById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const depot = await depotRepository.findById(id);
    if (!depot) {
      throw new NotFoundError("Depot not found");
    }
    res.status(200).json(depot);
  } catch (error) {
    next(error);
  }
};

export const createDepot = async (req, res, next) => {
  try {
    const {
      depot_name,
      location,
      contact_number,
      status = "ACTIVE",
    } = req.body;

    if (!depot_name || !location || !contact_number) {
      throw new ValidationError(
        "Missing required fields: depot_name, location, contact_number"
      );
    }

    const newId = await depotRepository.create({
      depot_name,
      location,
      contact_number,
      status,
    });

    await logAction(
      req.user,
      "Create Depot",
      `Depot name: ${depot_name}, ID=${newId}`,
      newId
    );

    res
      .status(201)
      .json({ message: "Depot created successfully", depot_id: newId });
  } catch (error) {
    next(error);
  }
};

export const updateDepot = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;

    const existing = await depotRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Depot not found");
    }

    const success = await depotRepository.update(id, updates);
    if (!success) {
      throw new NotFoundError("Depot not found or no changes");
    }

    await logAction(
      req.user,
      "Update Depot",
      `Depot ID=${id}, updated fields: ${JSON.stringify(updates)}`,
      id
    );

    res.status(200).json({ message: "Depot updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteDepot = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await depotRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Depot not found");
    }

    const success = await depotRepository.disable(id);
    if (!success) {
      throw new NotFoundError("Depot not found");
    }

    await logAction(
      req.user,
      "Disable Depot",
      `Depot ID=${id}, name=${existing.depot_name}`,
      id
    );

    res.status(200).json({ message: "Depot disabled successfully" });
  } catch (error) {
    next(error);
  }
};
