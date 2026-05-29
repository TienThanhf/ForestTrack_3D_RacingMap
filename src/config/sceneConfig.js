import * as THREE from 'three';

export const sceneColors = {
  background: 0x9ed9f3,
  nightBackground: 0x101b33,
  ground: 0x62bf55,
  shadowMarker: 0xf2b84b,
};

export const groundConfig = {
  size: 96,
};

export const cameraConfig = {
  fieldOfView: 48,
  nearPlane: 0.1,
  farPlane: 500,
  position: new THREE.Vector3(30, 24, 30),
  target: new THREE.Vector3(0, 0, 0),
};

export const orbitControlsConfig = {
  dampingFactor: 0.08,
  minDistance: 18,
  maxDistance: 90,
  minPolarAngle: THREE.MathUtils.degToRad(22),
  maxPolarAngle: THREE.MathUtils.degToRad(78),
  maxTargetRadius: 28,
};

export const daylightConfig = {
  day: {
    background: sceneColors.background,
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
  mapSize: 1024,
  cameraSize: 54,
  cameraNear: 1,
  cameraFar: 120,
  bias: -0.0004,
};

export const developmentShadowMarkerConfig = {
  size: 2,
  position: new THREE.Vector3(0, 1, 0),
};
