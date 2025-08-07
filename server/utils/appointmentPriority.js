export const PRIORITY_LEVELS = {
  EMERGENCY: 100,
  VIP: 80,
  PREMIUM: 60,
  REGULAR: 40,
  WALK_IN: 20,
};

export function calculateAppointmentPriority(
  clientType,
  serviceType,
  timeSlot,
  isReschedule = false
) {
  let priority = PRIORITY_LEVELS.REGULAR;

  // Base priority from client type
  switch (clientType) {
    case "vip":
      priority = PRIORITY_LEVELS.VIP;
      break;
    case "premium":
      priority = PRIORITY_LEVELS.PREMIUM;
      break;
    case "emergency":
      priority = PRIORITY_LEVELS.EMERGENCY;
      break;
    case "walk_in":
      priority = PRIORITY_LEVELS.WALK_IN;
      break;
    default:
      priority = PRIORITY_LEVELS.REGULAR;
  }

  // Adjust priority based on service type
  if (serviceType === "premium_service") {
    priority += 10;
  }

  // Boost priority for rescheduled appointments
  if (isReschedule) {
    priority += 15;
  }

  // Time-based adjustments
  const appointmentTime = new Date(timeSlot);
  const currentTime = new Date();
  const hoursDiff = (appointmentTime - currentTime) / (1000 * 60 * 60);

  // Urgent appointments (within next 2 hours)
  if (hoursDiff <= 2 && hoursDiff > 0) {
    priority += 20;
  }

  return priority;
}
