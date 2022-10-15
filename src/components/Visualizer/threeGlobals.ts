import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { createOutlinePass } from './outlinePass';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { UserData } from '../../types/UserData';
import { getScaledPosition } from './getScaledPosition';
import { getRandomCameraPosition } from './getRandomCameraPosition';
import { Vector3 } from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.0001,
  50000,
);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);

const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const outlinePass = createOutlinePass(scene, camera);

const effectFXAA = new ShaderPass(FXAAShader);
effectFXAA.uniforms.resolution.value.set(
  1 / window.innerWidth,
  1 / window.innerHeight,
);

composer.addPass(effectFXAA);

composer.addPass(outlinePass);

const loader = new OBJLoader();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.1;

const triggerOverheadView = (userInfo: UserData) => {
  const [x, y] = getScaledPosition(userInfo);

  new TWEEN.Tween(camera.position)
    .to({
      x,
      y,
      z: 1000,
    })
    .onUpdate((newCoords) => {
      camera.position.set(newCoords.x, newCoords.y, newCoords.z);
    })
    .easing(TWEEN.Easing.Quartic.InOut)
    .duration(5000)
    .start();
};

const triggerRocketView = (userInfo: UserData) => {
  const [x, y, z] = getScaledPosition(userInfo);
  const [xRand, yRand, zRand] = getRandomCameraPosition(userInfo);

  new TWEEN.Tween(camera.position)
    .to({
      x: x + xRand,
      y: y + yRand,
      z: z + zRand,
    })
    .onUpdate((newCoords) => {
      camera.position.set(newCoords.x, newCoords.y, newCoords.z);
    })
    .easing(TWEEN.Easing.Quartic.Out)
    .duration(5000)
    .start();
};

const triggerViewShift = (userInfo: UserData) => {
  const [x, y, z] = getScaledPosition(userInfo);

  const [xRand, yRand, zRand] = getRandomCameraPosition(userInfo);
  const newRocketVector = new Vector3(x + xRand, y + yRand, z + zRand);
  const overheadVector = new Vector3(x, y, 1000);

  const resultVector =
    camera.position.distanceTo(newRocketVector) <
    camera.position.distanceTo(overheadVector)
      ? overheadVector
      : newRocketVector;

  console.log(resultVector);

  new TWEEN.Tween(camera.position)
    .to(resultVector)
    .onUpdate((newCoords) => {
      camera.position.set(newCoords.x, newCoords.y, newCoords.z);
    })
    .easing(TWEEN.Easing.Quartic.Out)
    .duration(3000)
    .start();
};

export {
  scene,
  camera,
  loader,
  renderer,
  controls,
  outlinePass,
  composer,
  triggerOverheadView,
  triggerRocketView,
  triggerViewShift,
};
