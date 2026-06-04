import systemLogRepository from "../infrastructure/repository/SystemLog.js";
import ValidationError from "../domain/errors/validation-error.js";

export const getSystemLogs = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      userId,
      action,
      page = 1,
      limit = 50,
    } = req.query;
    const offset = (page - 1) * limit;
    const filters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (userId) filters.userId = parseInt(userId);
    if (action) filters.action = action;

    const logs = await systemLogRepository.findAll(
      parseInt(limit),
      offset,
      filters
    );
    const total = await systemLogRepository.count(filters);

    res.status(200).json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};
