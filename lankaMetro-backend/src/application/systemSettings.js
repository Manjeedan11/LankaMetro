import systemSettingsRepository from "../infrastructure/repository/SystemSettings.js";
import { logAction } from "../infrastructure/logging.js";
import ValidationError from "../domain/errors/validation-error.js";

export const getSettings = async (req, res, next) => {
  try {
    const settings = await systemSettingsRepository.getAll();
    res.status(200).json(settings);
  } catch (err) {
    next(err);
  }
};

export const updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    if (!key || value === undefined)
      throw new ValidationError("key and value required");

    await systemSettingsRepository.set(key, value, req.user.user_id);
    await logAction(
      req.user,
      "Update Setting",
      `Setting ${key} changed to ${value}`
    );
    res.status(200).json({ message: "Setting updated" });
  } catch (err) {
    next(err);
  }
};
