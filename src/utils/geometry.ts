import * as THREE from 'three';

/**
 * Generate points along a helix (spiral) path.
 * Returns array of positions for placing box segments.
 */
export function generateHelixPoints(
  centerX: number, centerZ: number,
  startY: number, endY: number,
  radius: number, turns: number, segments: number
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = t * turns * Math.PI * 2;
    const y = startY + (endY - startY) * t;
    const x = centerX + Math.cos(angle) * radius;
    const z = centerZ + Math.sin(angle) * radius;
    points.push(new THREE.Vector3(x, y, z));
  }
  return points;
}

/**
 * Generate points along a vertical loop (circle in XY plane).
 */
export function generateLoopPoints(
  centerX: number, centerY: number, centerZ: number,
  radius: number, segments: number
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = t * Math.PI * 2 - Math.PI / 2; // start from bottom
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    points.push(new THREE.Vector3(x, y, centerZ));
  }
  return points;
}

/**
 * Generate points along a funnel spiral (shrinking radius, descending).
 */
export function generateFunnelPoints(
  centerX: number, centerZ: number,
  topY: number, bottomY: number,
  topRadius: number, bottomRadius: number,
  turns: number, segments: number
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = t * turns * Math.PI * 2;
    const y = topY + (bottomY - topY) * t;
    const r = topRadius + (bottomRadius - topRadius) * t;
    const x = centerX + Math.cos(angle) * r;
    const z = centerZ + Math.sin(angle) * r;
    points.push(new THREE.Vector3(x, y, z));
  }
  return points;
}

/**
 * Create a tube geometry along a path of points.
 * Returns a mesh-ready TubeGeometry.
 */
export function createTubeFromPoints(
  points: THREE.Vector3[],
  tubeRadius: number,
  radialSegments = 8
): THREE.TubeGeometry {
  const curve = new THREE.CatmullRomCurve3(points);
  return new THREE.TubeGeometry(curve, points.length * 2, tubeRadius, radialSegments, false);
}

/**
 * Create a ramp (box) with rotation to create a slope.
 * Returns geometry positioned and rotated.
 */
export function createRampGeometry(
  width: number, height: number, depth: number
): THREE.BoxGeometry {
  return new THREE.BoxGeometry(width, height, depth);
}
