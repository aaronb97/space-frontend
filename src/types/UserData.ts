import { Planet } from './Planet';

export interface UserData {
  username: string;
  baseSpeed: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  velocityX: number;
  velocityY: number;
  velocityZ: number;
  nextBoost: string;
  serverTime: string;

  planet: Planet;
}
