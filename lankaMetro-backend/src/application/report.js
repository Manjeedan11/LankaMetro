import reportRepository from "../infrastructure/repository/Report.js";
import depotRepository from "../infrastructure/repository/Depot.js";
import ValidationError from "../domain/errors/validation-error.js";

export const getScheduleReport = async (req, res, next) => {
  try {
    const depotId = req.user.depotId;
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      throw new ValidationError(
        "startDate and endDate are required (YYYY-MM-DD)"
      );
    }
    const schedules = await reportRepository.getScheduleReport(
      depotId,
      startDate,
      endDate
    );
    res.status(200).json(schedules);
  } catch (err) {
    next(err);
  }
};

export const getMaintenanceReport = async (req, res, next) => {
  try {
    const depotId = req.user.depotId;
    const { startDate, endDate, vehicleId } = req.query;
    if (!startDate || !endDate) {
      throw new ValidationError(
        "startDate and endDate are required (YYYY-MM-DD)"
      );
    }
    const records = await reportRepository.getMaintenanceReport(
      depotId,
      startDate,
      endDate,
      vehicleId || null
    );
    res.status(200).json(records);
  } catch (err) {
    next(err);
  }
};

export const getRouteSummary = async (req, res, next) => {
  try {
    const depotId = req.user.depotId;
    const days = req.query.days ? parseInt(req.query.days) : 30;
    const summary = await reportRepository.getRouteSummary(depotId, days);
    res.status(200).json(summary);
  } catch (err) {
    next(err);
  }
};

export const exportScheduleReportPDF = async (req, res, next) => {
  try {
    const depotId = req.user.depotId;
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      throw new ValidationError("startDate and endDate are required");
    }

    const schedules = await reportRepository.getScheduleReport(
      depotId,
      startDate,
      endDate
    );
    const depot = await depotRepository.findById(depotId);
    const depotName = depot ? depot.depot_name : "Unknown Depot";

    const pdfBuffer = await reportRepository.generateScheduleReportPDF(
      schedules,
      startDate,
      endDate,
      depotName
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=schedule_report_${startDate}_to_${endDate}.pdf`
    );
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

export const exportMaintenanceReportPDF = async (req, res, next) => {
  try {
    const depotId = req.user.depotId;
    const { startDate, endDate, vehicleId } = req.query;
    if (!startDate || !endDate) {
      throw new ValidationError("startDate and endDate are required");
    }
    const records = await reportRepository.getMaintenanceReport(
      depotId,
      startDate,
      endDate,
      vehicleId || null
    );
    const depot = await depotRepository.findById(depotId);
    const depotName = depot ? depot.depot_name : "Unknown Depot";

    const pdfBuffer = await reportRepository.generateMaintenanceReportPDF(
      records,
      startDate,
      endDate,
      depotName
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=maintenance_report_${startDate}_to_${endDate}.pdf`
    );
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};
