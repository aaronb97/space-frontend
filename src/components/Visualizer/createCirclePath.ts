import * as THREE from 'three';

export const createCirclePath = (
  x: number,
  y: number,
  radius: number,
  segments: number,
) => {
  return new THREE.Path()
    .absarc(x, y, radius, 0, Math.PI * 2, false)
    .getSpacedPoints(segments);
};

export const createCircleGeometry = (
  ...args: Parameters<typeof createCirclePath>
) => {
  return new THREE.BufferGeometry().setFromPoints(createCirclePath(...args));
};
