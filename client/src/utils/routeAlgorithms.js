/**
 * Simple 2D geometry helpers for map visualizations.
 */

/**
 * Compute Euclidean distance between two points.
 */
export function dist(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Compute the convex hull of a set of 2D points using
 * the monotone chain (a.k.a. Andrew's) algorithm.
 *
 * Returns the hull vertices in counter-clockwise order.
 */
export function convexHull(points) {
  const pts = points
    .map((p) => [p[0], p[1]])
    .sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]));

  if (pts.length <= 1) return pts;

  const cross = (o, a, b) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

/**
 * Nearest-neighbor TSP heuristic.
 * Given an origin and a list of destination points, returns an
 * ordered array visiting each destination once and ending at the
 * last remaining point (does not force return to origin).
 */
export function nearestNeighborRoute(origin, destinations) {
  if (!destinations.length) return [];

  const visited = new Array(destinations.length).fill(false);
  const route = [];
  let current = origin;

  for (let i = 0; i < destinations.length; i++) {
    let bestIndex = -1;
    let bestDistance = Infinity;

    for (let j = 0; j < destinations.length; j++) {
      if (visited[j]) continue;
      const d = dist(current, destinations[j]);
      if (d < bestDistance) {
        bestDistance = d;
        bestIndex = j;
      }
    }

    if (bestIndex === -1) break;
    visited[bestIndex] = true;
    route.push(destinations[bestIndex]);
    current = destinations[bestIndex];
  }

  return route;
}

/**
 * Compute total length of a polyline route.
 */
export function routeDistance(route) {
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    total += dist(route[i - 1], route[i]);
  }
  return total;
}
