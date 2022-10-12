/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { usePlanets } from '../../hooks/usePlanets';
import { useUserData } from '../../hooks/useUserData';
import { User } from 'firebase/auth';
import * as TWEEN from '@tweenjs/tween.js';
import { UserData } from '../../types/UserData';
import { Planet } from '../../types/Planet';
import { getRandomCameraPosition } from './getRandomCameraPosition';
import { getScaledPosition } from './getScaledPosition';
import { makeObjLookAt } from './makeObjLookAt';
import { setObjColor } from './setObjColor';
import { processPlanetObjects } from './processPlanetObjects';
import { createOutlinePass } from './outlinePass';
import { createSky } from './createSky';
import { UserStatus } from '../../types/UserStatus';
import { setObjOpacity } from './setObjOpacity';
import { processCameraAnimation } from './processCameraAnimation';
import { circleInterval } from './circleInterval';
import { createPlanetSpheres } from './createPlanetSpheres';
import { Vector3 } from 'three';
import { DISTANCE_FACTOR } from './constants';

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

type Sphere = THREE.Mesh<THREE.SphereGeometry, THREE.Material>;
export type PlanetObjects = Record<
  string,
  {
    whiteSphere: Sphere;
    materialSphere?: Sphere;
    line?: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
    textureLoaded?: boolean;
    planet: Planet;
  }
>;

const planetObjects: PlanetObjects = {};

let sky: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> | undefined;
let rocketObj: THREE.Group | undefined;
let lastTimestamp: DOMHighResTimeStamp = 0;
let lastAnimationFrame: number | undefined;

interface Props {
  user: User;
}

const Visualizer = ({ user }: Props) => {
  const { planets } = usePlanets();
  const { userInfo } = useUserData(user);

  const ref = useRef<HTMLDivElement>(null);

  const [currentPlanetId, setCurrentPlanetId] = useState<number>();

  const { current: intervals } = useRef<NodeJS.Timer[]>([]);

  const startCircles = useCallback(
    (userToCircle: UserData) => {
      const interval = setInterval(() => {
        circleInterval(userToCircle, camera, scene);
      }, 1000 + Math.random() * 100);

      intervals.push(interval);
    },
    [intervals],
  );

  useEffect(() => {
    if (userInfo) {
      const users: Record<string, UserData> = {
        [userInfo.username]: userInfo,
      };

      userInfo.groups.forEach((group) =>
        group.users.forEach((user) => {
          users[user.username] = user;
        }),
      );

      intervals.forEach((interval) => clearInterval(interval));
      for (const user of Object.values(users)) {
        startCircles(user);
      }
    }

    if (!ref.current?.contains(renderer.domElement)) {
      ref.current?.appendChild(renderer.domElement);
      if (userInfo) {
        const [xRand, yRand, zRand] = getRandomCameraPosition(userInfo);

        const [x, y, z] = getScaledPosition(userInfo);

        camera.position.set(x + xRand, y + yRand, z + zRand);

        camera.lookAt(x, y, z);
      }
    }

    const animate = (timestamp: DOMHighResTimeStamp) => {
      lastAnimationFrame = requestAnimationFrame(animate);
      if (rocketObj && userInfo) {
        processCameraAnimation(
          timestamp - lastTimestamp,
          userInfo,
          camera,
          controls,
          rocketObj,
        );

        rocketObj.rotateOnAxis(
          new Vector3(
            rocketObj.position.x - userInfo.planet.positionX / DISTANCE_FACTOR,
            rocketObj.position.y - userInfo.planet.positionY / DISTANCE_FACTOR,
            rocketObj.position.z - userInfo.planet.positionZ / DISTANCE_FACTOR,
          ).normalize(),
          0.01,
        );
      }

      renderer.render(scene, camera);

      processPlanetObjects(planetObjects, camera, outlinePass, scene);

      controls.update();
      TWEEN.update();
      composer.render();
      lastTimestamp = timestamp;
    };

    if (lastAnimationFrame) {
      window.cancelAnimationFrame(lastAnimationFrame);
    }

    animate(lastTimestamp);
  }, [intervals, planets, startCircles, userInfo]);

  useEffect(() => {
    const obj = rocketObj;

    if (userInfo && obj) {
      const [x, y, z] = getScaledPosition(userInfo);

      obj.position.x = x;
      obj.position.y = y;
      obj.position.z = z;

      makeObjLookAt(obj, userInfo.planet);

      controls.target.set(x, y, z);
    }
  }, [
    userInfo,
    userInfo?.color,
    userInfo?.planet.positionX,
    userInfo?.planet.positionY,
    userInfo?.planet.positionZ,
    userInfo?.positionX,
    userInfo?.positionY,
    userInfo?.positionZ,
  ]);

  useEffect(() => {
    if (rocketObj) {
      if (userInfo?.status === UserStatus.TRAVELING) {
        setObjOpacity(rocketObj, 1);
      } else {
        setObjOpacity(rocketObj, 0);
      }
    }
  }, [userInfo?.status]);

  useEffect(() => {
    if (planets?.length && userInfo) {
      if (!sky) {
        sky = createSky();
        scene.add(sky);
      }

      const [x, y, z] = getScaledPosition(userInfo);

      sky.position.set(x, y, z);

      if (currentPlanetId && currentPlanetId !== userInfo.planet.id) {
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
      }

      setCurrentPlanetId(userInfo.planet.id);

      if (Object.keys(planetObjects).length === 0) {
        if (!rocketObj) {
          loader.load('Rocket.obj', (obj) => {
            rocketObj = obj;
            scene.add(obj);
            obj.position.set(x, y, z);

            makeObjLookAt(obj, userInfo.planet);
            setObjColor(obj, userInfo.color);

            const scale = 0.0005;
            obj.scale.set(scale, scale, scale);
          });
        }

        const light = new THREE.PointLight(0xffffff, 50, 0, 0.5);

        light.position.set(0, 0, 0);
        scene.add(light);

        controls.target.set(x, y, z);

        scene.add(new THREE.AmbientLight(0x101010));

        for (const planet of planets) {
          const { whiteSphere, line } = createPlanetSpheres(planet);
          scene.add(whiteSphere);
          if (line) {
            scene.add(line);
          }

          planetObjects[planet.name] = { whiteSphere, planet, line };
        }
      }
    }
  }, [currentPlanetId, planets, userInfo]);

  useEffect(() => {
    return () => {
      scene.remove.apply(scene, scene.children);
      sky = undefined;
      for (const key of Object.keys(planetObjects)) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete planetObjects[key];
      }

      rocketObj = undefined;
      intervals.forEach((interval) => clearInterval(interval));
    };
  }, [intervals]);

  return <div ref={ref} />;
};

export default Visualizer;
