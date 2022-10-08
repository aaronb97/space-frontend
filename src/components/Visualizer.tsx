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
import { usePlanets } from '../hooks/usePlanets';
import { useUserData } from '../hooks/useUserData';
import { User } from 'firebase/auth';
import { AdditiveBlending, Mesh, Vector3 } from 'three';
import { calculateDist } from '../utils/calculateDist';
import * as TWEEN from '@tweenjs/tween.js';
import { UserData } from '../types/UserData';
import { getModelName } from '../utils/getModelName';
import { Planet } from '../types/Planet';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
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

let sky: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> | undefined;
let rocketObj: THREE.Group | undefined;

const factor = 1000000;

interface Props {
  user: User;
}

const sqr = (num: number) => Math.pow(num, 2);

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

let lastTimestamp: DOMHighResTimeStamp = 0;
let lastAnimationFrame: number | undefined;

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

        const dist =
          calculateDist(
            {
              positionX: camera.position.x,
              positionY: camera.position.y,
              positionZ: camera.position.z,
            },
            {
              positionX: userToCircle.positionX / factor,
              positionY: userToCircle.positionY / factor,
              positionZ: userToCircle.positionZ / factor,
            },
          ) / 750;

        new TWEEN.Tween({ r: 1 })
          .to({
            r: 10,
          })
          .onUpdate(({ r }) => {
            l.geometry.dispose();
            const newg = new THREE.BufferGeometry().setFromPoints(
              new THREE.Path()
                .absarc(
                  userToCircle?.positionX / factor,
                  userToCircle?.positionY / factor,
                  r * dist,
                  0,
                  Math.PI * 2,
                  false,
                )
                .getSpacedPoints(100),
            );

            l.geometry = newg;
            l.position.z = userToCircle.positionZ / factor;
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
        const distance =
          userInfo.status === 0
            ? 0.01
            : (userInfo.planet.radius || 5000) / 500000;

        const [xRand, yRand, zRand] = [
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() / 2,
        ];

        const normal = 1 / Math.sqrt(sqr(xRand) + sqr(yRand) + sqr(zRand));
        const [xNorm, yNorm, zNorm] = [
          xRand * normal,
          yRand * normal,
          zRand * normal,
        ];

        const x = userInfo.positionX / factor;
        const y = userInfo.positionY / factor;
        const z = userInfo.positionZ / factor;

        camera.position.set(
          x + distance * xNorm,
          y + distance * yNorm,
          z + distance * zNorm,
        );

        camera.lookAt(x, y, z);
      }
    }

    const animate = (timestamp: DOMHighResTimeStamp) => {
      lastAnimationFrame = requestAnimationFrame(animate);
      if (rocketObj && userInfo) {
        const deltaT = (timestamp - lastTimestamp) / 1000 / 60 / 60;

        const xDiff = (userInfo.velocityX * deltaT) / factor;
        const yDiff = (userInfo.velocityY * deltaT) / factor;
        const zDiff = (userInfo.velocityZ * deltaT) / factor;
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
      const x = userInfo?.positionX / factor;
      const y = userInfo?.positionY / factor;
      const z = userInfo?.positionZ / factor;

      obj.position.x = x;
      obj.position.y = y;
      obj.position.z = z;

      obj.traverse((subObj) => {
        if (subObj instanceof Mesh) {
          subObj.material.color.set(userInfo.color);
          subObj.lookAt(
            new Vector3(
              userInfo.planet.positionX / factor,
              userInfo.planet.positionY / factor,
              userInfo.planet.positionZ / factor,
            ),
          );

          subObj.rotateX(1.5708);
        }
      });

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
        const skyGeo = new THREE.SphereGeometry(1000000, 25, 25);
        const skyTexture = new THREE.TextureLoader().load('models/space.jpg');
        const spaceMaterial = new THREE.MeshBasicMaterial({ map: skyTexture });
        sky = new THREE.Mesh(skyGeo, spaceMaterial);
        sky.material.side = THREE.DoubleSide;
        scene.add(sky);
      }

      const x = userInfo?.positionX / factor;
      const y = userInfo?.positionY / factor;
      const z = userInfo?.positionZ / factor;

      sky.position.x = x;
      sky.position.y = y;
      sky.position.z = z;

      if (currentPlanetId && currentPlanetId !== userInfo.planet.id) {
        const distance =
          userInfo.status === 0
            ? 0.01
            : (userInfo.planet.radius || 5000) / 500000;

        const [xRand, yRand, zRand] = [
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() / 2,
        ];

        const normal = 1 / Math.sqrt(sqr(xRand) + sqr(yRand) + sqr(zRand));
        const [xNorm, yNorm, zNorm] = [
          xRand * normal,
          yRand * normal,
          zRand * normal,
        ];

        const coords = {
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z,
        };

        new TWEEN.Tween(coords)
          .to({
            x: userInfo.positionX / factor + distance * xNorm,
            y: userInfo.positionY / factor + distance * yNorm,
            z: userInfo.positionZ / factor + distance * zNorm,
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
            obj.position.x = x;
            obj.position.y = y;
            obj.position.z = z;

            obj.traverse((subObj) => {
              if (subObj instanceof Mesh) {
                subObj.material.transparent = true;
                subObj.material.color.set(userInfo.color);
                subObj.lookAt(
                  new Vector3(
                    userInfo.planet.positionX / factor,
                    userInfo.planet.positionY / factor,
                    userInfo.planet.positionZ / factor,
                  ),
                );

                subObj.rotateX(1.5708);
              }
            });

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
          const x = planet.positionX / factor;
          const y = planet.positionY / factor;
          const z = planet.positionZ / factor;
          const radius = planet.radius ? planet.radius / factor : 0.005;

          const geometry = new THREE.SphereGeometry(radius, 32, 16);
          const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

          const whiteSphere = new THREE.Mesh(geometry, material);
          whiteSphere.material.transparent = true;
          whiteSphere.material.opacity = 0;
          scene.add(whiteSphere);

          whiteSphere.position.x = x;
          whiteSphere.position.y = y;
          whiteSphere.position.z = z;

          planetObjects[planet.name] = { whiteSphere, planet };

          if (planet.orbiting) {
            const orbiting = planet.orbiting;
            const orbX = (orbiting?.positionX ?? 0) / factor;
            const orbY = (orbiting?.positionY ?? 0) / factor;
            const orbZ = (orbiting?.positionZ ?? 0) / factor;
            const orbitRadius = Math.sqrt(
              sqr(x - orbX) + sqr(y - orbY) + sqr(z - orbZ),
            );

            const g = new THREE.BufferGeometry().setFromPoints(
              new THREE.Path()
                .absarc(
                  planet.orbiting ? planet.orbiting.positionX / factor : 0,
                  planet.orbiting ? planet.orbiting.positionY / factor : 0,
                  orbitRadius,
                  0,
                  Math.PI * 2,
                  false,
                )
                .getSpacedPoints(10000),
            );

            const m = new THREE.LineBasicMaterial({ color: 0x666666 });
            const l = new THREE.Line(g, m);
            l.position.z = (orbiting?.positionZ ?? 0) / factor;

            l.rotateY(
              // this is bogus
              new Vector3(
                planet.positionX,
                planet.positionY,
                planet.positionZ,
              ).angleTo(
                new Vector3(
                  planet.positionX,
                  planet.positionY,
                  planet.positionZ,
                ),
              ),
            );

            l.material.transparent = true;
            l.material.blending = AdditiveBlending;
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
