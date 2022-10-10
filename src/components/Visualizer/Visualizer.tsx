/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { usePlanets } from '../../hooks/usePlanets';
import { useUserData } from '../../hooks/useUserData';
import { User } from 'firebase/auth';
import { Mesh } from 'three';
import { calculateDist } from '../../utils/calculateDist';
import * as TWEEN from '@tweenjs/tween.js';
import { UserData } from '../../types/UserData';
import { getModelName } from '../../utils/getModelName';
import { Planet } from '../../types/Planet';
import { DISTANCE_FACTOR } from './constants';
import { getRandomCameraPosition } from './getRandomCameraPosition';
import { createCircleGeometry } from './createCirclePath';
import { createOrbitLine } from './createOrbitLine';
import { getScaledPosition } from './getScaledPosition';
import { makeObjLookAt } from './makeObjLookAt';
import { setObjColor } from './setObjColor';

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
renderer.setSize(window.innerWidth, window.innerHeight);

const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const outlinePass = new OutlinePass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  scene,
  camera,
);

const effectFXAA = new ShaderPass(FXAAShader);
effectFXAA.uniforms.resolution.value.set(
  1 / window.innerWidth,
  1 / window.innerHeight,
);

composer.addPass(effectFXAA);

outlinePass.edgeStrength = Number(3);
outlinePass.edgeGlow = Number(0.1);
outlinePass.edgeThickness = Number(0.1);
outlinePass.pulsePeriod = Number(0);
outlinePass.visibleEdgeColor.set('#190a05');
outlinePass.hiddenEdgeColor.set('#190a05');

composer.addPass(outlinePass);

const loader = new OBJLoader();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.1;

type Sphere = THREE.Mesh<THREE.SphereGeometry, THREE.Material>;

const planetObjects: Record<
  string,
  {
    whiteSphere: Sphere;
    materialSphere?: Sphere;
    line?: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
    textureLoaded?: boolean;
    planet: Planet;
  }
> = {};

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
        const m = new THREE.LineBasicMaterial({
          color: userToCircle.color,
          transparent: true,
        });

        const l = new THREE.Line(new THREE.BufferGeometry(), m);
        scene.add(l);

        const [positionX, positionY, positionZ] =
          getScaledPosition(userToCircle);

        const dist =
          calculateDist(
            {
              positionX: camera.position.x,
              positionY: camera.position.y,
              positionZ: camera.position.z,
            },
            {
              positionX,
              positionY,
              positionZ,
            },
          ) / 750;

        new TWEEN.Tween({ r: 1 })
          .to({
            r: 10,
          })
          .onUpdate(({ r }) => {
            l.geometry.dispose();
            const newg = createCircleGeometry(
              userToCircle?.positionX / DISTANCE_FACTOR,
              userToCircle?.positionY / DISTANCE_FACTOR,
              r * dist,
              100,
            );

            l.geometry = newg;
            l.position.z = userToCircle.positionZ / DISTANCE_FACTOR;
            l.material.opacity = dist > 0.001 ? 10 - r : 0;
          })
          .easing(TWEEN.Easing.Quadratic.Out)
          .duration(1000)
          .start();

        setTimeout(() => {
          scene.remove(l);
        }, 1000);
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
        const deltaT = (timestamp - lastTimestamp) / 1000 / 60 / 60;

        const xDiff = (userInfo.velocityX * deltaT) / DISTANCE_FACTOR;
        const yDiff = (userInfo.velocityY * deltaT) / DISTANCE_FACTOR;
        const zDiff = (userInfo.velocityZ * deltaT) / DISTANCE_FACTOR;
        rocketObj.position.x += xDiff;
        rocketObj.position.y += yDiff;
        rocketObj.position.z += zDiff;

        controls.target.set(
          rocketObj.position.x,
          rocketObj.position.y,
          rocketObj.position.z,
        );

        camera.position.x += xDiff;
        camera.position.y += yDiff;
        camera.position.z += zDiff;
      }

      renderer.render(scene, camera);

      Object.keys(planetObjects).forEach((key) => {
        const { materialSphere, whiteSphere, line, textureLoaded, planet } =
          planetObjects[key];

        if (isNaN(camera.position.x)) return;
        const radius = whiteSphere.geometry.boundingSphere?.radius ?? 0.1;
        const distance = camera.position.distanceTo(whiteSphere.position);

        const distanceRadiusFactor = distance / radius / 500;
        const scaleFactor = Math.max(distance / radius / 500, 1);

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
      if (userInfo?.status === 0) {
        rocketObj.traverse((obj) => {
          if (obj instanceof Mesh) {
            obj.material.opacity = 1;
          }
        });
      } else {
        rocketObj.traverse((obj) => {
          if (obj instanceof Mesh) {
            obj.material.opacity = 0;
          }
        });
      }
    }
  }, [userInfo?.status]);

  useEffect(() => {
    if (planets?.length && userInfo) {
      if (!sky) {
        const skyGeo = new THREE.SphereGeometry(2000000, 25, 25);
        const skyTexture = new THREE.TextureLoader().load('models/space.jpg');
        const spaceMaterial = new THREE.MeshBasicMaterial({ map: skyTexture });
        sky = new THREE.Mesh(skyGeo, spaceMaterial);
        sky.material.side = THREE.DoubleSide;
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

        const light = new THREE.PointLight(0xffffff, 1);
        light.position.set(0, 0, 0);
        scene.add(light);

        controls.target.set(x, y, z);

        scene.add(new THREE.AmbientLight(0x101010));

        for (const planet of planets) {
          const [x, y, z] = getScaledPosition(planet);

          const radius = planet.radius
            ? planet.radius / DISTANCE_FACTOR
            : 0.005;

          const geometry = new THREE.SphereGeometry(radius, 32, 16);
          const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

          const whiteSphere = new THREE.Mesh(geometry, material);
          whiteSphere.material.transparent = true;
          whiteSphere.material.opacity = 0;
          scene.add(whiteSphere);

          whiteSphere.position.set(x, y, z);

          planetObjects[planet.name] = { whiteSphere, planet };

          if (planet.orbiting) {
            const l = createOrbitLine(planet.orbiting, planet);
            scene.add(l);
            planetObjects[planet.name].line = l;
          }
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
