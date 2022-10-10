import * as THREE from 'three';
import { Mesh } from 'three';

export const setObjColor = (obj: THREE.Group, color: string) => {
  obj.traverse((subObj) => {
    if (subObj instanceof Mesh) {
      subObj.material.color.set(color);
    }
  });
};
