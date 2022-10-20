import { UserData } from '../../types/UserData';

import * as THREE from 'three';
import { Vector3 } from 'three';
import { DISTANCE_FACTOR } from './constants';

export const getUnitDirectionVector = (
  userInfo: UserData,
  obj: THREE.Group,
) => {
  return new Vector3(
    obj.position.x - userInfo.planet.positionX / DISTANCE_FACTOR,
    obj.position.y - userInfo.planet.positionY / DISTANCE_FACTOR,
    obj.position.z - userInfo.planet.positionZ / DISTANCE_FACTOR,
  ).normalize();
};
