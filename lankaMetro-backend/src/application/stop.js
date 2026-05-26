import stopRepository from "../infrastructure/repository/Stop.js";
import ValidationError from "../domain/errors/validation-error.js";
import NotFoundError from "../domain/errors/not-found-error.js";

export const getStops = async (req, res, next) => {
  try {
    const depotId = req.user.depotId;
    const stops = await stopRepository.findAll(depotId);
    res.status(200).json(stops);
  } catch (err) {
    next(err);
  }
};

export const getStopById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const depotId = req.user.depotId;
    const stop = await stopRepository.findById(id, depotId);
    if (!stop) throw new NotFoundError("Stop not found");
    res.status(200).json(stop);
  } catch (err) {
    next(err);
  }
};

export const createStop = async (req, res, next) => {
  try {
    const { stop_name, location } = req.body;
    const depotId = req.user.depotId;
    if (!stop_name) throw new ValidationError("stop_name is required");
    const newId = await stopRepository.create({
      stop_name,
      location,
      depot_id: depotId,
    });
    res.status(201).json({ message: "Stop created", stop_id: newId });
  } catch (err) {
    next(err);
  }
};

export const updateStop = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const depotId = req.user.depotId;
    const updates = req.body;
    const existing = await stopRepository.findById(id, depotId);
    if (!existing) throw new NotFoundError("Stop not found");
    const success = await stopRepository.update(id, depotId, updates);
    if (!success) throw new NotFoundError("Stop not found or no changes");
    res.status(200).json({ message: "Stop updated" });
  } catch (err) {
    next(err);
  }
};

export const deleteStop = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const depotId = req.user.depotId;
    const existing = await stopRepository.findById(id, depotId);
    if (!existing) throw new NotFoundError("Stop not found");
    await stopRepository.deleteById(id, depotId);
    res.status(200).json({ message: "Stop deleted" });
  } catch (err) {
    next(err);
  }
};
