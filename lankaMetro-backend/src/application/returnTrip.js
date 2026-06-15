import returnTripRepository from "../infrastructure/repository/ReturnTrip.js";
import scheduleRepository from "../infrastructure/repository/Schedule.js";
import driverRepository from "../infrastructure/repository/Driver.js";
import ValidationError from "../domain/errors/validation-error.js";
import NotFoundError from "../domain/errors/not-found-error.js";

export const updateReturnTripStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const depotId = req.user.depotId;
    const userRole = req.user.role;

    if (!status) throw new ValidationError("Status is required");

    const returnTrip = await returnTripRepository.findById(id);
    if (!returnTrip) throw new NotFoundError("Return trip not found");

    // Permission check for drivers
    if (userRole === "driver") {
      const schedule = await scheduleRepository.findById(
        returnTrip.original_schedule_id,
        depotId
      );
      if (!schedule) throw new NotFoundError("Linked schedule not found");
      const driver = await driverRepository.findByUserId(req.user.userId);
      if (!driver || schedule.driver_id !== driver.driver_id) {
        throw new ValidationError("You can only update your own return trips");
      }
    }

    await returnTripRepository.updateStatus(id, status);

    // Update driver availability based on status change
    const schedule = await scheduleRepository.findById(
      returnTrip.original_schedule_id,
      depotId
    );
    if (status === "IN_PROGRESS") {
      await driverRepository.updateAvailability(
        schedule.driver_id,
        "ON_DUTY",
        depotId
      );
    }
    if (status === "COMPLETED") {
      const remainingForward = await scheduleRepository.countRemainingToday(
        schedule.driver_id,
        schedule.schedule_date,
        null
      );
      const remainingReturn = await returnTripRepository.countRemainingToday(
        schedule.driver_id,
        schedule.schedule_date,
        id
      );
      if (remainingForward === 0 && remainingReturn === 0) {
        await driverRepository.updateAvailability(
          schedule.driver_id,
          "AVAILABLE",
          depotId
        );
      }
    }

    res.status(200).json({ message: "Return trip status updated" });
  } catch (err) {
    next(err);
  }
};
