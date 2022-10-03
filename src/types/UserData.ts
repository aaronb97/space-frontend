import { Planet } from './Planet';
import { UserGroup } from './UserGroup';

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
  speedBoostAvailable: boolean;
  notification?: string;

  planet: Planet;
  visitedPlanets: Planet[];
  groups: UserGroup[];
}
