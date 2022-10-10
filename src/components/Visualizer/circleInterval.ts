import { UserData } from '../../types/UserData';
import * as THREE from 'three';
import { calculateDist } from '../../utils/calculateDist';
import { DISTANCE_FACTOR } from './constants';
import { createCircleGeometry } from './createCirclePath';
import { getScaledPosition } from './getScaledPosition';
import * as TWEEN from '@tweenjs/tween.js';

export const circleInterval = (
  user: UserData,
  camera: THREE.Camera,
  scene: THREE.Scene,
) => {
  const m = new THREE.LineBasicMaterial({
    color: user.color,
    transparent: true,
  });

  const l = new THREE.Line(new THREE.BufferGeometry(), m);
  scene.add(l);

  const [positionX, positionY, positionZ] = getScaledPosition(user);

  const dist =
    calculateDist(
      {
        positionX: camera.position.x,
        positionY: camera.position.y,
        positionZ: camera.position.z,
      },
      {
        positionX,
        positionY,
        positionZ,
      },
    ) / 750;

  new TWEEN.Tween({ r: 1 })
    .to({
      r: 10,
    })
    .onUpdate(({ r }) => {
      l.geometry.dispose();
      const newg = createCircleGeometry(
        user?.positionX / DISTANCE_FACTOR,
        user?.positionY / DISTANCE_FACTOR,
        r * dist,
        100,
      );

      l.geometry = newg;
      l.position.z = user.positionZ / DISTANCE_FACTOR;
      l.material.opacity = dist > 0.001 ? 10 - r : 0;
    })
    .easing(TWEEN.Easing.Quadratic.Out)
    .duration(1000)
    .start();

  setTimeout(() => {
    scene.remove(l);
  }, 1000);
};
