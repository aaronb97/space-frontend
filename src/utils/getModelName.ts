import { Planet } from '../types/Planet';

const modelNames: Record<string, string> = {
  'The Sun': 'models/sun.jpg',
  Mercury: 'models/mercury.jpg',
  Venus: 'models/venus.jpg',
  Earth: 'models/earth.jpg',
  Jupiter: 'models/jupiter.jpg',
  Io: 'models/io.jpg',
  Callisto: 'models/callisto.jpg',
  Europa: 'models/europa.jpg',
  Ganymede: 'models/ganymede.jpg',
  Mars: 'models/mars.jpg',
  'The Moon': 'models/moon.jpg',
  Saturn: 'models/saturn.jpg',
  Titan: 'models/titan.jpg',
  Iapetus: 'models/iapetus.jpg',
  Uranus: 'models/uranus.jpg',
  Neptune: 'models/neptune.jpg',
  Triton: 'models/triton.png',
  Pluto: 'models/pluto.jpg',
};

export const getModelName = (planet: Planet) => {
  if (modelNames[planet.name]) {
    return modelNames[planet.name];
  }

  if (planet.type === 'moon') {
    return 'models/moon.jpg';
  }

  if (planet.type === 'star') {
    return 'models/sun.jpg';
  }

  return 'models/moon.jpg';
};
