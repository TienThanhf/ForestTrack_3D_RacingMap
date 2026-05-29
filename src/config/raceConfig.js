import * as THREE from 'three';

export const raceModeConfig = {
  driving: {
    acceleration: 13,
    reverseAcceleration: 8,
    friction: 6,
    brakeDeceleration: 17,
    maxForwardSpeed: 15,
    maxReverseSpeed: 5,
    steeringRate: THREE.MathUtils.degToRad(105),
    steeringSpeedInfluence: 0.28,
  },
  camera: {
    followOffset: new THREE.Vector3(0, 5.2, -9),
    lookAheadDistance: 5.5,
    lookHeight: 1.1,
    positionSmoothing: 0.11,
  },
};
