/**
 * GPS Navigation Utilities for BarberHood
 * Integrates with Google Maps, Apple Maps, and offline navigation
 */

/**
 * Generate Google Maps navigation URL
 * @param {number} destination_lat - Destination latitude
 * @param {number} destination_lng - Destination longitude
 * @param {object} options - Navigation options
 * @returns {string} Google Maps URL
 */
export function generateGoogleMapsURL(
  destination_lat,
  destination_lng,
  options = {},
) {
  const {
    origin_lat = null,
    origin_lng = null,
    mode = "driving", // driving, walking, transit, bicycling
    travelMode = true,
  } = options;

  let url = `https://www.google.com/maps/dir/?api=1`;

  if (origin_lat && origin_lng) {
    url += `&origin=${origin_lat},${origin_lng}`;
  }

  url += `&destination=${destination_lat},${destination_lng}`;
  url += `&travelmode=${mode}`;

  return url;
}

/**
 * Generate Apple Maps navigation URL
 * @param {number} destination_lat - Destination latitude
 * @param {number} destination_lng - Destination longitude
 * @param {string} destination_name - Restaurant name
 * @returns {string} Apple Maps URL
 */
export function generateAppleMapsURL(
  destination_lat,
  destination_lng,
  destination_name = "Destination",
) {
  return `maps://maps.apple.com/?daddr=${destination_lat},${destination_lng}&dirflg=d&q=${encodeURIComponent(destination_name)}`;
}

/**
 * Generate OpenStreetMap (Leaflet) navigation URL
 * @param {number} destination_lat - Destination latitude
 * @param {number} destination_lng - Destination longitude
 * @param {number} zoom - Zoom level
 * @returns {string} OpenStreetMap URL
 */
export function generateOpenStreetMapURL(
  destination_lat,
  destination_lng,
  zoom = 15,
) {
  return `https://www.openstreetmap.org/?mlat=${destination_lat}&mlon=${destination_lng}&zoom=${zoom}`;
}

/**
 * Calculate remaining distance and ETA
 * @param {number} current_lat - Current latitude
 * @param {number} current_lng - Current longitude
 * @param {number} destination_lat - Destination latitude
 * @param {number} destination_lng - Destination longitude
 * @param {number} speed_kmh - Average speed in km/h (default: 40 for city driving)
 * @returns {object} Distance and ETA
 */
export function calculateETA(
  current_lat,
  current_lng,
  destination_lat,
  destination_lng,
  speed_kmh = 40,
) {
  const toRadians = (degree) => degree * (Math.PI / 180);
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRadians(destination_lat - current_lat);
  const dLon = toRadians(destination_lng - current_lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(current_lat)) *
      Math.cos(toRadians(destination_lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  const timeMinutes = Math.round((distance / speed_kmh) * 60);
  const timeHours = Math.floor(timeMinutes / 60);
  const timeRemainingMinutes = timeMinutes % 60;

  return {
    distanceKm: parseFloat(distance.toFixed(2)),
    distanceM: Math.round(distance * 1000),
    timeMinutes,
    timeHours,
    timeRemainingMinutes,
    formattedTime:
      timeHours > 0
        ? `${timeHours}h ${timeRemainingMinutes}m`
        : `${timeRemainingMinutes}m`,
    speedKmh: speed_kmh,
  };
}

/**
 * Format coordinates to readable format
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {string} Formatted coordinates
 */
export function formatCoordinates(lat, lng) {
  const formatDMS = (decimal, isLat) => {
    const absolute = Math.abs(decimal);
    const degrees = Math.floor(absolute);
    const minutesDecimal = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesDecimal);
    const seconds = ((minutesDecimal - minutes) * 60).toFixed(2);

    const direction = isLat
      ? decimal >= 0
        ? "N"
        : "S"
      : decimal >= 0
        ? "E"
        : "W";

    return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
  };

  return {
    decimal: { lat, lng },
    dms: {
      latitude: formatDMS(lat, true),
      longitude: formatDMS(lng, false),
    },
  };
}

/**
 * Validate coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} Valid coordinates
 */
export function isValidCoordinates(lat, lng) {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Convert address to coordinates (requires external API)
 * @param {string} address - Address string
 * @returns {Promise<object>} Coordinates
 */
export async function geocodeAddress(address) {
  // This would integrate with Google Geocoding API or similar
  // Placeholder implementation
  throw new Error("Geocoding requires external API configuration");
}

/**
 * Get bearing between two points
 * @param {number} lat1 - Starting latitude
 * @param {number} lng1 - Starting longitude
 * @param {number} lat2 - Ending latitude
 * @param {number} lng2 - Ending longitude
 * @returns {number} Bearing in degrees (0-360)
 */
export function calculateBearing(lat1, lng1, lat2, lng2) {
  const toRadians = (degree) => degree * (Math.PI / 180);
  const toDegrees = (radian) => radian * (180 / Math.PI);

  const dLng = toRadians(lng2 - lng1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

  const bearing = (toDegrees(Math.atan2(y, x)) + 360) % 360;
  return bearing;
}

/**
 * Get compass direction from bearing
 * @param {number} bearing - Bearing in degrees
 * @returns {string} Compass direction
 */
export function getCompassDirection(bearing) {
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round(bearing / 22.5) % 16;
  return directions[index];
}

export default {
  generateGoogleMapsURL,
  generateAppleMapsURL,
  generateOpenStreetMapURL,
  calculateETA,
  formatCoordinates,
  isValidCoordinates,
  calculateBearing,
  getCompassDirection,
};
