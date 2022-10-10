import { PlanetObjects } from './Visualizer';
import * as THREE from 'three';
import { getModelName } from '../../utils/getModelName';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';

export const processPlanetObjects = (
  planetObjects: PlanetObjects,
  camera: THREE.Camera,
  outlinePass: OutlinePass,
  scene: THREE.Scene,
) => {
  Object.keys(planetObjects).forEach((key) => {
    const { materialSphere, whiteSphere, line, textureLoaded, planet } =
      planetObjects[key];

    const radius = whiteSphere.geometry.boundingSphere?.radius ?? 0.1;
    const distance = camera.position.distanceTo(whiteSphere.position);

    const distanceRadiusFactor = distance / radius / 500;
    const scaleFactor = Math.max(distanceRadiusFactor, 1);

    if (distanceRadiusFactor < 2 && !textureLoaded) {
      planetObjects[key].textureLoaded = true;
      const geometry = new THREE.SphereGeometry(radius, 32, 16);

      const MaterialType =
        planet.type !== 'star'
          ? THREE.MeshStandardMaterial
          : THREE.MeshBasicMaterial;

      const material = new MaterialType({
        map: new THREE.TextureLoader().load(getModelName(planet)),
      });

      const materialSphere = new THREE.Mesh(geometry, material);
      materialSphere.position.x = whiteSphere.position.x;
      materialSphere.position.y = whiteSphere.position.y;
      materialSphere.position.z = whiteSphere.position.z;

      planetObjects[planet.name].materialSphere = materialSphere;
      outlinePass.selectedObjects.push(materialSphere);
    }

    if (distanceRadiusFactor > 1) {
      whiteSphere.material.opacity = 1;
    }

    if (distanceRadiusFactor < 1 && materialSphere) {
      scene.add(materialSphere);
      whiteSphere.material.opacity = Math.pow(distanceRadiusFactor, 3);
    } else if (materialSphere) {
      scene.remove(materialSphere);
    }

    if (line) {
      line.material.opacity = Math.pow(distanceRadiusFactor, 3);
    }

    if (materialSphere) {
      materialSphere.rotation.y += 0.0002;
    }

    whiteSphere.scale.set(scaleFactor, scaleFactor, scaleFactor);
  });
};
