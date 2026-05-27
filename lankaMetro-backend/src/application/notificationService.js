import notificationRepository from "../infrastructure/repository/Notification.js";

export async function notifyDriver(driverId, message, type) {
  if (!driverId) return;
  return notificationRepository.create({ message, type, driverId });
}
