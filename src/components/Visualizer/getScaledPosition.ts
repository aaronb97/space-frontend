import { PositionLike } from '../../types/PositionLike';
import { DISTANCE_FACTOR } from './constants';

export const getScaledPosition = ({
  positionX,
  positionY,
  positionZ,
}: PositionLike): [number, number, number] => {
  return [
    positionX / DISTANCE_FACTOR,
    positionY / DISTANCE_FACTOR,
    positionZ / DISTANCE_FACTOR,
  ];
};
