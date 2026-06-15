import notificationRepository from "../infrastructure/repository/Notification.js";

export async function notifyDriver(driverId, message, type) {
  if (!driverId) return;
  // ✅ Use correct key names: user_id (null), message, type, driver_id
  return notificationRepository.create({
    user_id: null,
    message,
    type,
    driver_id: driverId,
  });
}
