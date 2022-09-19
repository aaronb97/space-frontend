import { Planet } from './Planet';

export interface UserData {
  username: string;
  velocityX: number;
  velocityY: number;
  velocityZ: number;
  nextBoost: string;

  planet: Planet;
}
