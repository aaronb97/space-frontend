import * as THREE from 'three';
import { Mesh } from 'three';

export const setObjOpacity = (obj: THREE.Group, opacity: number) => {
  obj.traverse((obj) => {
    if (obj instanceof Mesh) {
      obj.material.opacity = opacity;
    }
  });
};
