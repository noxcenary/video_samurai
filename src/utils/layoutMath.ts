import * as THREE from 'three';
import type { ArrangementMode, SceneControls } from '../types/frame';

export interface FrameTransform {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
}

/**
 * Calculates target 3D position and rotation for a frame given mode & scene settings.
 */
export function calculateFrameTransform(
  index: number,
  totalFrames: number,
  aspectRatio: number,
  controls: SceneControls
): FrameTransform {
  const { mode, spacing, rotationAngle, curvature, scale: scaleMultiplier, depthOffset } = controls;

  const baseWidth = 3 * scaleMultiplier;
  const baseHeight = (3 / Math.max(0.1, aspectRatio)) * scaleMultiplier;
  const frameScale = new THREE.Vector3(baseWidth, baseHeight, 1);

  const pos = new THREE.Vector3(0, 0, 0);
  const rot = new THREE.Euler(0, 0, 0);

  // Center offset index (so sequence is centered around origin)
  const halfTotal = (totalFrames - 1) / 2;
  const relIndex = index - halfTotal;

  if (mode === 'stack') {
    // STACK MODE: Parallel stacked planes along Z-axis
    // Spacing controls distance between planes along Z
    const zPos = -relIndex * (spacing * 0.8 + 0.2);
    const xPos = relIndex * depthOffset * 0.3; // subtle horizontal stagger option
    const yPos = 0;

    pos.set(xPos, yPos, zPos);

    // Rotation angle converts to pitch/yaw twist
    const radRotation = THREE.MathUtils.degToRad(rotationAngle);
    const ry = relIndex * radRotation * 0.05;
    const rx = 0;
    const rz = 0;
    rot.set(rx, ry, rz);

  } else if (mode === 'fan') {
    // FAN MODE: Fan arc / spiral formation
    // Curvature determines arc radius
    const angleStep = THREE.MathUtils.degToRad(rotationAngle > 0 ? rotationAngle : 8);
    const angle = relIndex * angleStep;

    const radius = Math.max(1, (10 / Math.max(0.1, curvature)) + (spacing * 2));

    // Calculate position along circular arc
    const xPos = Math.sin(angle) * radius;
    const zPos = -Math.cos(angle) * radius + radius - (relIndex * spacing * 0.3);
    const yPos = relIndex * depthOffset * 0.2;

    pos.set(xPos, yPos, zPos);

    // Frame faces radially outward along arc
    const ry = -angle;
    const rx = (curvature - 1) * 0.02 * relIndex;
    rot.set(rx, ry, 0);

  } else if (mode === 'helix') {
    // HELIX MODE: 3D Spiral Helix winding back in space
    const turns = 1.5 + (curvature * 0.2);
    const angle = (index / Math.max(1, totalFrames)) * Math.PI * 2 * turns;
    const radius = 3 + spacing * 1.5;

    const xPos = Math.cos(angle) * radius;
    const yPos = Math.sin(angle) * radius * 0.6;
    const zPos = -index * (spacing * 0.5 + 0.3);

    pos.set(xPos, yPos, zPos);

    const ry = -angle + Math.PI / 2;
    const rx = THREE.MathUtils.degToRad(rotationAngle * 0.2);
    rot.set(rx, ry, 0);

  } else if (mode === 'grid') {
    // GRID MODE: Clean matrix display wall
    const columns = Math.ceil(Math.sqrt(totalFrames * 1.5));
    const col = index % columns;
    const row = Math.floor(index / columns);
    const rows = Math.ceil(totalFrames / columns);

    const colOffset = (columns - 1) / 2;
    const rowOffset = (rows - 1) / 2;

    const gapX = baseWidth + spacing * 0.4;
    const gapY = baseHeight + spacing * 0.4;

    const xPos = (col - colOffset) * gapX;
    const yPos = -(row - rowOffset) * gapY;
    const zPos = -index * depthOffset * 0.1;

    pos.set(xPos, yPos, zPos);

    const ry = THREE.MathUtils.degToRad(rotationAngle * (col - colOffset) * 0.5);
    rot.set(0, ry, 0);
  }

  return { position: pos, rotation: rot, scale: frameScale };
}
