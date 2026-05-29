import * as THREE from 'three';

export const trackConfig = {
  roadWidth: 7.5,
  sampleCount: 96,
  surfaceHeight: 0.035,
  color: 0x2f3438,
  controlPoints: [
    new THREE.Vector3(-30, 0, -17),
    new THREE.Vector3(-11, 0, -25),
    new THREE.Vector3(19, 0, -23),
    new THREE.Vector3(35, 0, -10),
    new THREE.Vector3(29, 0, 8),
    new THREE.Vector3(13, 0, 23),
    new THREE.Vector3(-12, 0, 22),
    new THREE.Vector3(-31, 0, 12),
    new THREE.Vector3(-36, 0, -4),
  ],
};

export const curbConfig = {
  segmentCount: 112,
  length: 1.85,
  width: 0.9,
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

export const barrierConfig = {
  segmentCount: 88,
  length: 2.25,
  width: 0.45,
  height: 0.95,
  curbGap: 0.72,
  surfaceGap: 0.02,
  color: 0xf3f1e6,
  pitOpening: {
    side: -1,
    startT: 0.12,
    endT: 0.25,
  },
};
