import systemLogRepository from "../infrastructure/repository/SystemLog.js";

export async function logAction(user, action, details, depotId = null) {
  const userId = user?.user_id || null;
  const userName = user?.full_name || user?.email || "System";
  await systemLogRepository.create({
    user_id: userId,
    user_name: userName,
    action,
    details,
    depot_id: depotId,
  });
}
