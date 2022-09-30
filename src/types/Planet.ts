export interface Planet {
  name: string;
  id: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  radius: number;

  orbiting?: Planet;
}
