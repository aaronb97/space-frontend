import { Planet } from './Planet';

export interface UserData {
  status: number;
  username: string;
  speed: number;
  baseSpeed: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  velocityX: number;
  velocityY: number;
  velocityZ: number;
  nextBoost: string;
  serverTime: string;
  landingTime?: string;
  items?: Array<{
    name: string;
    rarity: string;
  }>;

  planet: Planet;
}
