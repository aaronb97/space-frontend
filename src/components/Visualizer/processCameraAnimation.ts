import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { UserData } from '../../types/UserData';
import { DISTANCE_FACTOR } from './constants';

export const processCameraAnimation = (
  diff: number,
  user: UserData,
  camera: THREE.Camera,
  controls: OrbitControls,
  obj: THREE.Group,
) => {
  const timeFactor = diff / 1000 / 60 / 60;

  const xDiff = (user.velocityX * timeFactor) / DISTANCE_FACTOR;
  const yDiff = (user.velocityY * timeFactor) / DISTANCE_FACTOR;
  const zDiff = (user.velocityZ * timeFactor) / DISTANCE_FACTOR;
  obj.position.x += xDiff;
  obj.position.y += yDiff;
  obj.position.z += zDiff;

  controls.target.set(obj.position.x, obj.position.y, obj.position.z);

  camera.position.x += xDiff;
  camera.position.y += yDiff;
  camera.position.z += zDiff;
};
