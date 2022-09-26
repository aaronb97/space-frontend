interface PositionLike {
  positionX: number;
  positionY: number;
  positionZ: number;
}

const square = (num: number) => Math.pow(num, 2);

export const calculateDist = (a: PositionLike, b: PositionLike) => {
  return Math.sqrt(
    square(b.positionX - a.positionX) +
      square(b.positionY - a.positionY) +
      square(b.positionZ - a.positionZ),
  );
};
