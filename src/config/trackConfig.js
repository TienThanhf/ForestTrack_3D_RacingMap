import * as THREE from 'three';

export const trackConfig = {
  roadWidth: 8.4,
  sampleCount: 144,
  surfaceHeight: 0.035,
  color: 0x1f2428,
  controlPoints: [
    new THREE.Vector3(-35, 0, -18),
    new THREE.Vector3(-23, 0, -31),
    new THREE.Vector3(-4, 0, -24),
    new THREE.Vector3(13, 0, -34),
    new THREE.Vector3(32, 0, -23),
    new THREE.Vector3(39, 0, -5),
    new THREE.Vector3(25, 0, 8),
    new THREE.Vector3(35, 0, 25),
    new THREE.Vector3(13, 0, 34),
    new THREE.Vector3(-8, 0, 24),
    new THREE.Vector3(-28, 0, 32),
    new THREE.Vector3(-39, 0, 12),
    new THREE.Vector3(-28, 0, -1),
  ],
};

export const curbConfig = {
  segmentCount: 144,
  width: 0.82,
  height: 0.18,
  roadEdgeGap: 0.18,
  surfaceGap: 0.018,
  red: 0xd9362b,
  yellow: 0xf4c542,
};

export const shoulderLineConfig = {
  width: 0.24,
  roadEdgeGap: 0.06,
  surfaceGap: 0.012,
  color: 0xf7f2d5,
};

export const startFinishConfig = {
  trackT: 0.105,
  surfaceGap: 0.038,
  stripeHeight: 0.02,
  stripeRows: 2,
  stripeColumns: 8,
  stripeDepth: 0.42,
  widthPadding: 0.8,
  lightColor: 0xffffff,
  darkColor: 0x15191d,
};

export const roadDecorationConfig = {
  surfaceGap: 0.052,
  variation: {
    patchHeight: 0.012,
    patches: [
      { t: 0.045, lateralOffset: -1.4, width: 2.8, length: 5.2, color: 0x30363a, opacity: 0.16 },
      { t: 0.165, lateralOffset: 1.1, width: 2.4, length: 4.4, color: 0x15191d, opacity: 0.14 },
      { t: 0.275, lateralOffset: -0.8, width: 2.7, length: 5.6, color: 0x34393d, opacity: 0.13 },
      { t: 0.39, lateralOffset: 1.5, width: 2.2, length: 4.8, color: 0x171b1f, opacity: 0.12 },
      { t: 0.52, lateralOffset: -1.2, width: 3, length: 5, color: 0x32383c, opacity: 0.14 },
      { t: 0.66, lateralOffset: 0.8, width: 2.6, length: 4.6, color: 0x15191d, opacity: 0.12 },
      { t: 0.79, lateralOffset: -1.1, width: 2.8, length: 5.4, color: 0x343a3e, opacity: 0.13 },
      { t: 0.92, lateralOffset: 1.3, width: 2.3, length: 4.8, color: 0x181d21, opacity: 0.12 },
    ],
  },
  arrows: {
    color: 0xf7f2d5,
    opacity: 0.92,
    length: 3.1,
    width: 1.55,
    shaftWidth: 0.56,
    headBase: 0.42,
    placements: [
      // Adjust t/lateralOffset/rotationOffset to tune each arrow against the local road tangent.
      { t: 0.9825, lateralOffset: -0.2, longitudinalOffset: 0.15, rotationOffset: 0 },
      { t: 0.205, lateralOffset: -0.45, longitudinalOffset: -0.1, rotationOffset: 0 },
      { t: 0.335, lateralOffset: 0.35, longitudinalOffset: 0, rotationOffset: 0 },
      { t: 0.5, lateralOffset: -0.35, longitudinalOffset: 0.1, rotationOffset: 0 },
      { t: 0.695, lateralOffset: 0.35, longitudinalOffset: -0.05, rotationOffset: 0 },
      { t: 0.86, lateralOffset: -0.25, longitudinalOffset: 0.1, rotationOffset: 0 },
    ],
  },
};

export const barrierConfig = {
  segmentCount: 160,
  length: 2.25,
  width: 0.22,
  height: 0.92,
  curbGap: 0.82,
  surfaceGap: 0.02,
  color: 0xf3f1e6,
  railColor: 0xdde8e9,
  postColor: 0xf6f1df,
  railHeight: 0.82,
  lowerRailHeight: 0.46,
  railThickness: 0.16,
  postWidth: 0.18,
  maxSegmentLength: 3.6,
  maxTurnAngle: THREE.MathUtils.degToRad(22),
  cornerFilletSegments: 4,
  pitOpening: {
    side: -1,
    startT: 0.09,
    endT: 0.29,
  },
};
