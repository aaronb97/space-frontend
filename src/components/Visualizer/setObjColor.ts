import * as THREE from 'three';
import { Mesh, MeshBasicMaterial, MeshStandardMaterial } from 'three';
import praseColor from 'parse-color';

export const setObjColor = (obj: THREE.Group, color: string) => {
  const colorObj = praseColor(color);

  obj.traverse((subObj) => {
    if (subObj instanceof Mesh) {
      if (subObj.name.includes('Window')) {
        subObj.material = new MeshBasicMaterial();

        const hours = new Date().getHours();

        if (hours >= 8 && hours < 20) {
          subObj.material.color.set(0xfff8e3);
        } else {
          subObj.material.color.set(0x000000);
        }
      } else if (subObj.name.includes('Body')) {
        subObj.material = new MeshStandardMaterial();
        subObj.material.color.set(colorObj.hex);
        subObj.material.metalness = 1;
      } else {
        subObj.material = new MeshStandardMaterial();
        const [h, s, l] = colorObj.hsl;
        const hsl = `hsl(${h}, ${s}%, ${l - 50}%)`;
        subObj.material.color.set(hsl);
        subObj.material.metalness = 1;
      }
    }
  });
};
