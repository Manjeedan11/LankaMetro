import notificationRepository from "../infrastructure/repository/Notification.js";
import pool from "../infrastructure/db.js";
import NotFoundError from "../domain/errors/not-found-error.js";

async function getDriverIdByUserId(userId) {
  const result = await pool.query(
    "SELECT driver_id FROM driver WHERE user_id = $1",
    [userId]
  );
  return result.rows[0]?.driver_id || null;
}

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    let notifications = [];

    if (role === "driver") {
      const driverId = await getDriverIdByUserId(userId);
      if (driverId) {
        notifications = await notificationRepository.findByDriverId(driverId);
      }
    } else {
      // Admin, logistics_officer, depot_supervisor, etc.
      notifications = await notificationRepository.findByUserId(userId);
    }

    res.status(200).json(notifications);
  } catch (err) {
    next(err);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const success = await notificationRepository.deleteById(id);
    if (!success) throw new NotFoundError("Notification not found");
    res.status(200).json({ message: "Notification deleted" });
  } catch (err) {
    next(err);
  }
};
