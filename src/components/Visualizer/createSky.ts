import * as THREE from 'three';

export const createSky = () => {
  const skyGeo = new THREE.SphereGeometry(2000000, 25, 25);
  const skyTexture = new THREE.TextureLoader().load('models/space.jpg');
  const spaceMaterial = new THREE.MeshBasicMaterial({ map: skyTexture });
  const sky = new THREE.Mesh(skyGeo, spaceMaterial);
  sky.material.side = THREE.DoubleSide;

  return sky;
};
