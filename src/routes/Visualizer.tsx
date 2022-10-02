/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { usePlanets } from '../hooks/usePlanets';
import { useUserData } from '../hooks/useUserData';
import { User } from 'firebase/auth';
import { Vector3 } from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { UserStatus } from '../types/UserStatus';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.001,
  50000,
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const loader = new OBJLoader();

camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 10000;

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

const spheres: Array<
  THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>
> = [];

const objects: THREE.Group[] = [];

const Visualizer = ({ user }: Props) => {
  const { planets } = usePlanets();
  const { userInfo } = useUserData(user);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current?.contains(renderer.domElement)) {
      ref.current?.appendChild(renderer.domElement);
      const animate = () => {
        requestAnimationFrame(animate);

        renderer.render(scene, camera);

        spheres.forEach((sphere) => {
          const distance = camera.position.distanceTo(sphere.position);

          const scaleFactor = Math.max(distance, 1);

          sphere.scale.set(scaleFactor, scaleFactor, scaleFactor);
        });

        controls.update();
        TWEEN.update();
      };

      animate();
    }
  }, [planets, userInfo]);

  useEffect(() => {
    if (planets?.length && userInfo) {
      scene.clear();
      const x = userInfo?.positionX / factor;
      const y = userInfo?.positionY / factor;
      const z = userInfo?.positionZ / factor;

      loader.load('Rocket.obj', (obj) => {
        scene.add(obj);
        objects.push(obj);
        obj.position.x = x;
        obj.position.y = y;
        obj.position.z = z;
        const scale = 0.001;
        obj.scale.set(scale, scale, scale);
      });

      const light = new THREE.PointLight(0xffffff, 1, 100000);
      light.position.set(0, 0, 0);
      scene.add(light);

      controls.target.set(x, y, z);
      const coords = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      };

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

      const zoomFactor =
        userInfo.status === UserStatus.LANDED
          ? userInfo.planet.radius / 100000
          : 0.01;

      new TWEEN.Tween(coords)
        .to({
          x: userInfo.positionX / factor + xNorm * zoomFactor,
          y: userInfo.positionY / factor + yNorm * zoomFactor,
          z: userInfo.positionZ / factor + zNorm * zoomFactor,
        })
        .onUpdate((newCoords) => {
          camera.position.set(newCoords.x, newCoords.y, newCoords.z);
        })
        .easing(TWEEN.Easing.Quartic.Out)
        .duration(10000)
        .start();

      for (const planet of planets) {
        const x = planet.positionX / factor;
        const y = planet.positionY / factor;
        const z = planet.positionZ / factor;
        const radius = planet.radius ? planet.radius / factor : 0.005;
        const geometry = new THREE.SphereGeometry(radius, 32, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
        spheres.push(sphere);

        sphere.position.x = x;
        sphere.position.y = y;
        sphere.position.z = z;

        scene.add(sphere);

        // const text = new SpriteText(planet.name);
        // text.position.x = x;
        // text.position.y = y;
        // text.position.z = z + 10;
        // scene.add(text);

        // if (planet.name.includes('Moon')) {
        //   // eslint-disable-next-line no-debugger
        //   debugger;
        // }

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

        const m = new THREE.LineBasicMaterial({ color: 0xaaaaaa });
        const l = new THREE.Line(g, m);
        l.rotateY(
          // this is bogus
          new Vector3(
            planet.positionX,
            planet.positionY,
            planet.positionZ,
          ).angleTo(new Vector3(planet.positionX, planet.positionY, 0)),
        );

        scene.add(l);
      }
    }

    return () => {
      scene.clear();
    };
  }, [planets, userInfo]);

  return <div ref={ref} />;
};

export default Visualizer;
