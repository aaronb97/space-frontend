import * as THREE from 'three';
import { AdditiveBlending } from 'three';
import { Planet } from '../../types/Planet';
import { DISTANCE_FACTOR, ORBITING_LINE_COLOR } from './constants';
import { createCircleGeometry } from './createCirclePath';
import { getScaledPosition } from './getScaledPosition';
import { sqr } from './sqr';

export const createOrbitLine = (orbiting: Planet, base: Planet) => {
  const [x, y, z] = getScaledPosition(base);
  const [orbX, orbY, orbZ] = getScaledPosition(orbiting);
  const orbitRadius = Math.sqrt(sqr(x - orbX) + sqr(y - orbY) + sqr(z - orbZ));

  const g = createCircleGeometry(
    orbiting.positionX / DISTANCE_FACTOR,
    orbiting.positionY / DISTANCE_FACTOR,
    orbitRadius,
    10000,
  );

  const m = new THREE.LineBasicMaterial({
    color: ORBITING_LINE_COLOR,
  });

  const l = new THREE.Line(g, m);
  l.position.z = orbiting.positionZ / DISTANCE_FACTOR;

  l.material.transparent = true;
  l.material.blending = AdditiveBlending;

  return l;
};
