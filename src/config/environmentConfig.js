import * as THREE from 'three';

export const pitAreaConfig = {
  trackT: 0.18,
  side: -1,
  lateralOffset: 10.4,
  platform: {
    width: 7.2,
    length: 12,
    height: 0.22,
    color: 0xb8a27a,
  },
  posts: {
    radius: 0.13,
    height: 3.1,
    color: 0xf4f0d8,
  },
  roof: {
    width: 8,
    length: 12.8,
    height: 0.38,
    y: 3.35,
    color: 0xf2a33c,
  },
  sign: {
    width: 3.4,
    height: 1,
    depth: 0.18,
    color: 0xe3d26f,
  },
  clearancePadding: 1.4,
};

export const startGateConfig = {
  trackT: 0.13,
  side: -1,
  postOffset: 5.7,
  postWidth: 0.45,
  postHeight: 5.25,
  crossbarHeight: 0.55,
  crossbarDepth: 0.55,
  color: 0xf3f1e6,
  accentColor: 0xd9362b,
  clearancePadding: 1,
};

export const forestConfig = {
  treeCount: 48,
  seed: 7342,
  groundMargin: 5,
  trackClearance: 10.8,
  structurePadding: 1.2,
  minTreeSpacing: 4.1,
  sampleCount: 120,
  trunkColor: 0x8a5a35,
  foliageColors: [0x1f7a3a, 0x2e9145, 0x176b35],
  trunkSegments: 6,
  foliageSegments: 7,
  scaleRange: {
    min: 0.82,
    max: 1.28,
  },
};

export const streetLampConfig = {
  poleColor: 0xf3f1e6,
  baseColor: 0xd6d0bf,
  bulbColor: 0xfff1a8,
  bulbDayColor: 0xfff1a8,
  bulbNightColor: 0xffdf72,
  bulbEmissiveColor: 0xffc857,
  bulbEmissiveIntensity: 1.35,
  lightColor: 0xffc96b,
  lightIntensity: 1.55,
  lightDistance: 14,
  lightDecay: 1.8,
  poleHeight: 3.5,
  poleRadius: 0.08,
  baseRadius: 0.28,
  bulbRadius: 0.22,
  headOffset: new THREE.Vector3(0.32, 3.55, 0),
  placements: [
    { t: 0.19, side: -1, lateralOffset: 6.9 },
    { t: 0.29, side: -1, lateralOffset: 6.7 },
    { t: 0.46, side: -1, lateralOffset: 7.1 },
    { t: 0.73, side: -1, lateralOffset: 7.2 },
  ],
};
