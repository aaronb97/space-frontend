import * as THREE from 'three';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';

export const createOutlinePass = (scene: THREE.Scene, camera: THREE.Camera) => {
  const outlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera,
  );

  outlinePass.edgeStrength = Number(3);
  outlinePass.edgeGlow = Number(0.1);
  outlinePass.edgeThickness = Number(0.1);
  outlinePass.pulsePeriod = Number(0);
  outlinePass.visibleEdgeColor.set('#190a05');
  outlinePass.hiddenEdgeColor.set('#190a05');

  return outlinePass;
};
