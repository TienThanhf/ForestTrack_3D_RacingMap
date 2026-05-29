import * as THREE from 'three';

export const playerCarConfig = {
  modelPath: '/models/player-car.glb',
  startParameter: 0.105,
  verticalOffset: 0.045,
  importedModel: {
    scale: 1,
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
  },
  fallback: {
    body: {
      width: 1.85,
      height: 0.48,
      length: 3.15,
      color: 0xd9362b,
    },
    cabin: {
      width: 1.25,
      height: 0.5,
      length: 1.25,
      color: 0x8ed6f2,
    },
    wheel: {
      radius: 0.34,
      depth: 0.28,
      color: 0x222326,
      hubColor: 0xf3f1e6,
    },
  },
  headlights: {
    color: 0xfff2bf,
    intensity: 4.2,
    distance: 28,
    angle: THREE.MathUtils.degToRad(21),
    penumbra: 0.45,
    decay: 1.3,
    lensRadius: 0.13,
    lensDayColor: 0xf3f1e6,
    lensNightColor: 0xfff2bf,
    lensEmissiveIntensity: 1.6,
    leftPosition: new THREE.Vector3(-0.55, 0.72, 1.65),
    rightPosition: new THREE.Vector3(0.55, 0.72, 1.65),
    targetOffset: new THREE.Vector3(0, 0.25, 8),
  },
};
