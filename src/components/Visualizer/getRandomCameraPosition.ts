import { UserData } from '../../types/UserData';
import { UserStatus } from '../../types/UserStatus';
import { sqr } from './sqr';

export const getRandomCameraPosition = (
  user: UserData,
): [number, number, number] => {
  const distance =
    user.status === UserStatus.TRAVELING
      ? 0.01
      : (user.planet.radius || 5000) / 500000;

  const [xRand, yRand, zRand] = [
    Math.random() - 0.5,
    Math.random() - 0.5,
    Math.random() / 2,
  ];

  const normal = 1 / Math.sqrt(sqr(xRand) + sqr(yRand) + sqr(zRand));
  return [
    xRand * normal * distance,
    yRand * normal * distance,
    zRand * normal * distance,
  ];
};
