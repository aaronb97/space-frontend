/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import SpriteText from 'three-spritetext';
import { usePlanets } from '../hooks/usePlanets';
import { useUserData } from '../hooks/useUserData';
import { User } from 'firebase/auth';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  5000,
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

camera.position.z = 10;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.1;

const factor = 10000000;

interface Props {
  user: User;
}

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

        controls.update();
      };
      animate();
    }
  }, [planets]);

  useEffect(() => {
    if (planets?.length && userInfo) {
      const userText = new SpriteText(userInfo?.username);
      userText.position.x = userInfo?.positionX / factor;
      userText.position.y = userInfo?.positionY / factor;
      userText.position.z = userInfo?.positionZ / factor;

      scene.add(userText);

      for (const planet of planets) {
        const text = new SpriteText(planet.name);
        // const { positionX: x, positionY: y, positionZ: z } = planet;
        const x = planet.positionX / factor;
        const y = planet.positionY / factor;
        const z = planet.positionZ / factor;
        text.position.x = x;
        text.position.y = y;
        text.position.z = z;

        scene.add(text);

        const g = new THREE.BufferGeometry().setFromPoints(
          new THREE.Path()
            .absarc(
              0,
              0,
              Math.sqrt(x * x + y * y + z * z),
              0,
              Math.PI * 2,
              false,
            )
            .getSpacedPoints(100),
        );
        const m = new THREE.LineBasicMaterial({ color: 0xaaaaaa });
        const l = new THREE.Line(g, m);
        scene.add(l);
      }
    }
  }, [planets, userInfo]);

  return <div ref={ref}></div>;
};

export default Visualizer;
