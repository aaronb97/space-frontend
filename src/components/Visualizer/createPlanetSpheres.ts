import * as THREE from 'three';
import { Planet } from '../../types/Planet';
import { DISTANCE_FACTOR } from './constants';
import { createOrbitLine } from './createOrbitLine';
import { getScaledPosition } from './getScaledPosition';

/**
 * materialSphere is dynamically loaded in processPlanetObjects
 */
export const createPlanetSpheres = (planet: Planet) => {
  const [x, y, z] = getScaledPosition(planet);

  const radius = planet.radius ? planet.radius / DISTANCE_FACTOR : 0.005;

  const geometry = new THREE.SphereGeometry(radius, 32, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const whiteSphere = new THREE.Mesh(geometry, material);
  whiteSphere.material.transparent = true;
  whiteSphere.material.opacity = 0;

  whiteSphere.position.set(x, y, z);

  return {
    whiteSphere,
    line: planet.orbiting
      ? createOrbitLine(planet.orbiting, planet)
      : undefined,
  };
};
