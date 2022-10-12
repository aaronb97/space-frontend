import * as THREE from 'three';
import { Mesh, Vector3 } from 'three';
import { PositionLike } from '../../types/PositionLike';
import { getScaledPosition } from './getScaledPosition';

export const makeObjLookAt = (obj: THREE.Group, target: PositionLike) => {
  const [x, y, z] = getScaledPosition(target);

  obj.traverse((subObj) => {
    if (subObj instanceof Mesh) {
      subObj.lookAt(new Vector3(x, y, z));
    }
  });
};
