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
import { Vector3 } from 'three';
import { calculateDist } from '../utils/calculateDist';
import * as TWEEN from '@tweenjs/tween.js';
import { UserData } from '../types/UserData';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.001,
  50000,
);

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

camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 1000;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.1;

const factor = 1000000;

interface Props {
  user: User;
}

const sqr = (num: number) => Math.pow(num, 2);

type Sphere = THREE.Mesh<THREE.SphereGeometry, THREE.Material>;
const spheres: Array<{ whiteSphere: Sphere; materialSphere?: Sphere }> = [];

const objects: THREE.Group[] = [];

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
      }, 1000);

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
      const animate = () => {
        requestAnimationFrame(animate);

        renderer.render(scene, camera);

        spheres.forEach(({ whiteSphere, materialSphere }) => {
          const radius = whiteSphere.geometry.boundingSphere?.radius ?? 0.1;
          const distance = camera.position.distanceTo(whiteSphere.position);

          const distanceRadiusFactor = distance / radius / 500;
          const scaleFactor = Math.max(distance / radius / 500, 1);

          if (materialSphere) {
            console.log(distanceRadiusFactor);
          }

          if (distanceRadiusFactor < 1 && materialSphere) {
            scene.add(materialSphere);
            whiteSphere.material.opacity = Math.pow(distanceRadiusFactor, 3);
          } else if (materialSphere) {
            scene.remove(materialSphere);
          }

          whiteSphere.scale.set(scaleFactor, scaleFactor, scaleFactor);
        });

        controls.update();
        TWEEN.update();
        composer.render();
      };

      animate();
    }

    return () => {
      scene.clear();
      intervals.forEach((interval) => clearInterval(interval));
    };
  }, [intervals, planets, startCircles, userInfo]);

  useEffect(() => {
    if (planets?.length && userInfo) {
      scene.clear();
      // outlinePass.selectedObjects = [];
      const x = userInfo?.positionX / factor;
      const y = userInfo?.positionY / factor;
      const z = userInfo?.positionZ / factor;

      if (userInfo.status === 0) {
        loader.load('Rocket.obj', (obj) => {
          scene.add(obj);
          objects.push(obj);
          obj.position.x = x;
          obj.position.y = y;
          obj.position.z = z;
          const scale = 0.001;
          obj.scale.set(scale, scale, scale);
        });
      }

      const light = new THREE.PointLight(0xffffff, 1, 100000);
      light.position.set(0, 0, 0);
      scene.add(light);

      controls.target.set(x, y, z);

      if (currentPlanetId !== userInfo.planet.id) {
        console.log('TRIGGER CAMERA PAN');
        const distance = Math.max(
          calculateDist(userInfo, userInfo.planet) / factor,
          2,
        );

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
          .easing(TWEEN.Easing.Quartic.InOut)
          .duration(10000)
          .start();

        setCurrentPlanetId(userInfo.planet.id);
      }

      for (const planet of planets) {
        const x = planet.positionX / factor;
        const y = planet.positionY / factor;
        const z = planet.positionZ / factor;
        const radius = planet.radius ? planet.radius / factor : 0.005;

        if (planet.name === 'Earth') {
          const geometry = new THREE.SphereGeometry(radius, 32, 16);
          const material = new THREE.MeshStandardMaterial({
            map: new THREE.TextureLoader().load('models/earth.jpg'),
          });

          const whiteMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
          });

          const whiteSphere = new THREE.Mesh(geometry, whiteMaterial);

          const materialSphere = new THREE.Mesh(geometry, material);
          materialSphere.position.x = x;
          materialSphere.position.y = y;
          materialSphere.position.z = z;
          whiteSphere.position.x = x;
          whiteSphere.position.y = y;
          whiteSphere.position.z = z;
          scene.add(whiteSphere);

          spheres.push({ materialSphere, whiteSphere });
          outlinePass.selectedObjects.push(materialSphere);
        } else {
          const geometry = new THREE.SphereGeometry(radius, 32, 16);
          const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

          const whiteSphere = new THREE.Mesh(geometry, material);
          whiteSphere.material.transparent = true;
          scene.add(whiteSphere);

          whiteSphere.position.x = x;
          whiteSphere.position.y = y;
          whiteSphere.position.z = z;

          spheres.push({ whiteSphere });
        }

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
        // l.material.blending = AdditiveBlending;

        l.rotateY(
          // this is bogus
          new Vector3(
            planet.positionX,
            planet.positionY,
            planet.positionZ,
          ).angleTo(
            new Vector3(planet.positionX, planet.positionY, planet.positionZ),
          ),
        );

        scene.add(l);
      }
    }

    return () => {
      scene.clear();
    };
  }, [currentPlanetId, planets, userInfo]);

  return <div ref={ref} />;
};

export default Visualizer;
