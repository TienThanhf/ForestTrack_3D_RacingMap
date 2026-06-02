import * as THREE from 'three';

export const sceneColors = {
  background: 0x9ed9f3,
  nightBackground: 0x101b33,
  ground: 0x62bf55,
};

export const groundConfig = {
  size: 96,
};

export const cameraConfig = {
  fieldOfView: 48,
  nearPlane: 0.1,
  farPlane: 500,
  position: new THREE.Vector3(32, 26, 34),
  target: new THREE.Vector3(0, 0, 0),
};

export const orbitControlsConfig = {
  exploreDamping: 0.1,
  zoomSpeed: 0.72,
  panSpeed: 0.72,
  minDistance: 12,
  maxDistance: 105,
  minPolarAngle: THREE.MathUtils.degToRad(18),
  maxPolarAngle: THREE.MathUtils.degToRad(84),
  maxTargetRadius: 28,
  groundClearance: 1.2,
  focusDistanceMultiplier: 1.7,
  minFocusDistance: 12,
  maxFocusDistance: 64,
};

export const daylightConfig = {
  day: {
    background: sceneColors.background,
    fog: {
      color: sceneColors.background,
      density: 0.0055,
    },
    hemisphere: {
      skyColor: 0xd7f5ff,
      groundColor: 0x7aa35a,
      intensity: 1.5,
    },
    sun: {
      color: 0xffffff,
      intensity: 2.4,
      position: new THREE.Vector3(-24, 32, 20),
    },
  },
  night: {
    background: sceneColors.nightBackground,
    fog: {
      color: sceneColors.nightBackground,
      density: 0.009,
    },
    hemisphere: {
      skyColor: 0x263a68,
      groundColor: 0x17251e,
      intensity: 0.56,
    },
    sun: {
      color: 0xaec8ff,
      intensity: 0.62,
      position: new THREE.Vector3(18, 30, -22),
    },
  },
};

export const shadowConfig = {
  mapSize: 2048,
  cameraSize: 62,
  cameraNear: 1,
  cameraFar: 120,
  bias: -0.00025,
  normalBias: 0.018,
  radius: 1.6,
};
