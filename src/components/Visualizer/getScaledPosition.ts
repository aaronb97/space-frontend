import { DISTANCE_FACTOR } from './constants';

export const getScaledPosition = ({
  positionX,
  positionY,
  positionZ,
}: {
  positionX: number;
  positionY: number;
  positionZ: number;
}): [number, number, number] => {
  return [
    positionX / DISTANCE_FACTOR,
    positionY / DISTANCE_FACTOR,
    positionZ / DISTANCE_FACTOR,
  ];
};
