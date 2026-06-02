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
  walls: {
    color: 0xf4f0d8,
    trimColor: 0xd9362b,
    thickness: 0.28,
    height: 2.2,
    doorWidth: 2.2,
    doorHeight: 1.45,
    doorColor: 0x39444a,
  },
  sign: {
    width: 3.4,
    height: 1,
    depth: 0.18,
    color: 0xe3d26f,
  },
  interiorLights: {
    insetX: 0.82,
    insetZ: 0.95,
    height: 2.85,
    bulbRadius: 0.14,
    bulbColor: 0xfff1b8,
    emissiveColor: 0xffc857,
    dayIntensity: 0.55,
    nightIntensity: 1.65,
    distance: 6.5,
    decay: 1.8,
  },
  decorations: {
    floor: {
      width: 9.2,
      length: 14.4,
      height: 0.045,
      color: 0x767c78,
    },
    markings: {
      color: 0xf7f2d5,
      height: 0.024,
      lineWidth: 0.08,
    },
    tireStack: {
      position: new THREE.Vector3(-2.65, 0.34, -3.15),
      tireRadius: 0.42,
      tubeRadius: 0.11,
      spacing: 0.19,
      count: 3,
      color: 0x121416,
    },
    toolBoxes: [
      { position: new THREE.Vector3(2.4, 0.47, -3.45), size: new THREE.Vector3(0.9, 0.48, 0.46), color: 0xd9362b },
      // Rear-right corner keeps this box clear of both parked cars.
      { position: new THREE.Vector3(3.05, 0.4, -4.55), size: new THREE.Vector3(0.72, 0.34, 0.42), color: 0x2f80ed },
    ],
    barrels: [
      // Rear-left service corner avoids the black parked car bay.
      { position: new THREE.Vector3(-3.18, 0.57, -4.62), color: 0xf4c542 },
      { position: new THREE.Vector3(-2.62, 0.57, -4.62), color: 0xd9362b },
    ],
    shelf: {
      position: new THREE.Vector3(2.85, 1.0, -1.25),
      width: 0.34,
      height: 1.38,
      length: 1.72,
      color: 0x39444a,
      shelfColor: 0xd6d0bf,
    },
    serviceLamps: {
      positions: [
        new THREE.Vector3(-3.15, 1.22, 4.25),
        new THREE.Vector3(3.15, 1.22, 4.25),
      ],
      poleRadius: 0.045,
      poleHeight: 1.25,
      bulbRadius: 0.12,
      poleColor: 0xf3f1e6,
      bulbColor: 0xffe6a3,
      dayIntensity: 0,
      nightIntensity: 0.9,
      distance: 5,
      decay: 1.6,
    },
  },
  forestTrackSign: {
    // Tweak trackPlacement to keep the sign behind/inside the inner barrier (side: 1).
    trackPlacement: {
      t: 0.138,
      side: 1,
      lateralOffset: 9.2,
      height: 3.0,
      rotationOffset: 0,
    },
    scale: 1.9,
    postHeight: 2.6,
    postSpacing: 3.2,
    postWidth: 0.14,
    boardWidth: 4.0,
    boardHeight: 1.15,
    boardDepth: 0.16,
    frameWidth: 0.1,
    postColor: 0x1f2721, // Sleek deep graphite
    boardColor: 0x111612, // Slate black backing
    frameColor: 0xd4af37, // Polished classic gold frame
    capColor: 0xd4af37, // Polished gold post caps
    capSize: 0.22,
    textColor: '#24402a',
    accentColor: '#c42b20',
  },
  clearancePadding: 1.4,
};

export const teapotTrophyConfig = {
  localPosition: new THREE.Vector3(2.65, 0, -7.15),
  rotationY: THREE.MathUtils.degToRad(-18),
  size: 0.5,
  segments: 5,
  color: 0xf2c84b,
  accentColor: 0xe05a35,
  pedestal: {
    radius: 0.72,
    height: 0.28,
    segments: 8,
    color: 0xf7f2d5,
  },
};

export const startGateConfig = {
  trackT: 0.122,
  side: -1,
  postOffset: 5.7,
  postWidth: 0.45,
  postHeight: 5.25,
  crossbarHeight: 0.55,
  crossbarDepth: 0.55,
  color: 0xf3f1e6,
  accentColor: 0xd9362b,
  clearancePadding: 1,
  roadLights: {
    positions: [-3.6, -1.2, 1.2, 3.6],
    color: 0xffe6a3,
    dayIntensity: 0,
    nightIntensity: 4.2,
    distance: 15,
    angle: Math.PI / 5,
    penumbra: 0.4,
    decay: 1.25,
    radius: 0.16,
    height: 0.12,
    surfaceTargetY: 0.05,
  },
};

export const billboardConfig = {
  logoPath: '/logo.png',
  placement: {
    t: 0.055,
    side: 1,
    lateralOffset: 10.2,
    rotationOffset: THREE.MathUtils.degToRad(-7),
  },
  panel: {
    width: 6.4,
    height: 3.05,
    depth: 0.24,
    bottomHeight: 1.75,
    frontColor: 0xffffff,
    sideColor: 0x20262a,
    backColor: 0x161b1e,
    roughness: 0.58,
    metalness: 0.04,
    dayEmissiveIntensity: 0.28,
    nightEmissiveIntensity: 0.82,
  },
  poles: {
    radius: 0.12,
    height: 4.65,
    spacing: 4.95,
    color: 0xf3f1e6,
    roughness: 0.62,
    metalness: 0.08,
  },
  exclusionPadding: {
    width: 1.8,
    length: 1.4,
  },
};

export const forestConfig = {
  treeCount: 72,
  seed: 7342,
  groundMargin: 5,
  trackClearance: 11.7,
  structurePadding: 1.2,
  minTreeSpacing: 3.6,
  sampleCount: 180,
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
  modelPath: '/models/streetlight.glb',
  modelScale: 1,
  poleColor: 0xf3f1e6,
  baseColor: 0xd6d0bf,
  bulbColor: 0xfff1a8,
  bulbDayColor: 0xfff1a8,
  bulbNightColor: 0xffdf72,
  bulbEmissiveColor: 0xffc857,
  bulbEmissiveIntensity: 1.35,
  lightColor: 0xffeab5,
  dayIntensity: 0,
  // Brighter street lights closer to the road: warm cones now cover the driveable surface.
  nightIntensity: 12,
  lightIntensity: 12,
  lightDistance: 42,
  lightDecay: 1.2,
  lightAngle: Math.PI / 3.2,
  lightPenumbra: 0.55,
  lightHeight: 5.15,
  lightTargetRoadOffset: 3.2,
  shadow: {
    mapSize: 1024,
    cameraNear: 0.18,
    bias: -0.00028,
    normalBias: 0.018,
    radius: 1.8,
  },
  poleHeight: 3.5,
  poleRadius: 0.08,
  baseRadius: 0.28,
  bulbRadius: 0.22,
  headOffset: new THREE.Vector3(0.32, 3.55, 0),
  placements: [
    { t: 0.02, side: -1, lateralOffset: 6.3 },
    { t: 0.155, side: 1, lateralOffset: 6.2 },
    { t: 0.31, side: -1, lateralOffset: 6.3 },
    { t: 0.43, side: 1, lateralOffset: 6.2 },
    { t: 0.57, side: -1, lateralOffset: 6.2 },
    { t: 0.705, side: 1, lateralOffset: 6.3 },
    { t: 0.84, side: -1, lateralOffset: 6.3 },
    { t: 0.94, side: 1, lateralOffset: 6.2 },
  ],
};

export const rockConfig = {
  modelPath: '/models/rock.glb',
  placements: [
    { t: 0.095, side: -1, lateralOffset: 7.8, scale: 0.72, rotation: 0.4 },
    { t: 0.275, side: -1, lateralOffset: 7.9, scale: 0.62, rotation: 2.9 },
    { t: 0.295, side: -1, lateralOffset: 8.9, scale: 0.46, rotation: 5.1 },
    { t: 0.47, side: 1, lateralOffset: 7.8, scale: 0.56, rotation: 2.2 },
    { t: 0.74, side: 1, lateralOffset: 8.1, scale: 0.66, rotation: 4.4 },
  ],
};
