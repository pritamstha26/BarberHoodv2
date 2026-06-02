/**
 * Dynamic pricing utility for restaurant services.
 *
 * This algorithm adjusts service prices based on current demand.
 * Demand is measured as active appointment load divided by total seat capacity.
 * When utilization exceeds the configured threshold, prices increase up to a
 * capped surge percentage.
 *
 * The algorithm uses the following formula:
 *
 *   utilization = activeAppointments / totalCapacity
 *   surgeRatio = clamp((utilization - threshold) / (1 - threshold), 0, 1)
 *   multiplier = 1 + maxSurge * surgeRatio
 *   dynamicPrice = ceil(basePrice * multiplier)
 *
 * This ensures prices remain stable below the threshold and increase smoothly
 * as utilization grows. The multiplier is capped at 1 + maxSurge.
 */

export const calculateDynamicPricing = ({
  basePrice,
  activeAppointments,
  totalCapacity,
  threshold = 0.6,
  maxSurge = 0.5,
}) => {
  const price = Number(basePrice || 0);
  const utilization =
    totalCapacity > 0 ? activeAppointments / totalCapacity : 0;
  const clampedUtilization = Math.min(Math.max(utilization, 0), 1);
  const usageAboveThreshold = Math.max(0, clampedUtilization - threshold);
  const surgeRatio =
    threshold >= 1 ? 0 : Math.min(usageAboveThreshold / (1 - threshold), 1);
  const multiplier = 1 + maxSurge * surgeRatio;
  const dynamicPrice = Math.ceil(price * multiplier);

  return {
    originalPrice: price,
    dynamicPrice,
    multiplier: Number(multiplier.toFixed(2)),
    utilization: Number(clampedUtilization.toFixed(3)),
    threshold,
    maxSurge,
  };
};
