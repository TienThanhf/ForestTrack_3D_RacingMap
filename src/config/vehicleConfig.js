import * as THREE from 'three';

export const GREEN_CAR_WHEEL_NAMES = {
  frontLeft: 'WFL',
  frontRight: 'WFR',
  rearLeft: 'WRL',
  rearRight: 'WRR',
};

export const BLACK_CAR_WHEEL_NAMES = {
  frontLeft: 'Wheel_FL',
  frontRight: 'Wheel_FR',
  rearLeft: 'Wheel_RL',
  rearRight: 'Wheel_RR',
};

export const playerCarConfig = {
  defaultCarId: 'green',
  carModels: {
    green: {
      id: 'green',
      label: 'Green Car',
      modelPath: '/models/green_car.glb',
      scale: 0.0035,
      position: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(0, 0, 0),
      wheelNames: GREEN_CAR_WHEEL_NAMES,
      parked: {
        position: new THREE.Vector3(2.1, 0.26, 1.9),
        rotation: new THREE.Euler(0, Math.PI, 0),
      },
    },
    redgray: {
      id: 'redgray',
      label: 'Black Car',
      modelPath: '/models/black_car.glb',
      scale: 0.76,
      position: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(0, 0, 0),
      wheelNames: BLACK_CAR_WHEEL_NAMES,
      steeringAxis: 'z',
      spinAxis: 'x',
      preserveWheelBaseRotation: true,
      parked: {
        position: new THREE.Vector3(-2.1, 0.26, 1.8),
        rotation: new THREE.Euler(0, Math.PI, 0),
      },
    },
  },
  modelPath: '/models/green_car.glb',
  startParameter: 0.105,
  startStagingOffset: 2.4,
  verticalOffset: 0.045,
  importedModel: {
    scale: 0.0035,
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
  },
  wheel: {
    radius: 0.235,
    maxSteeringAngle: 0.45,
    steeringSmoothness: 12,
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
    nightIntensity: 13.5,
    distance: 46,
    angle: THREE.MathUtils.degToRad(27),
    penumbra: 0.58,
    decay: 1.12,
    lensRadius: 0.13,
    lensDayColor: 0xf3f1e6,
    lensNightColor: 0xfff2bf,
    lensEmissiveIntensity: 2.1,
    leftPosition: new THREE.Vector3(-0.55, 0.72, 1.65),
    rightPosition: new THREE.Vector3(0.55, 0.72, 1.65),
    targetOffset: new THREE.Vector3(0, -0.58, 18),
  },
};
