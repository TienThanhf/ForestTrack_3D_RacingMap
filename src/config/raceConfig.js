import * as THREE from 'three';

export const raceModeConfig = {
  driving: {
    acceleration: 13,
    reverseAcceleration: 8,
    friction: 6,
    brakeDeceleration: 17,
    // Speed decrease by 5 units: current forward cap returns from 20 to 15 while controls stay unchanged.
    maxForwardSpeed: 15,
    maxReverseSpeed: 5,
    steeringRate: THREE.MathUtils.degToRad(105),
    steeringSpeedInfluence: 0.28,
    roadBoundaryPadding: 0.65,
    offTrackSpeedRetention: 0.62,
  },
  raceTimer: {
    lapOptions: [1, 2, 3, 5],
    defaultLapCount: 3,
    startLineT: 0.105,
    triggerDepth: 2.8,
    triggerWidthPadding: 0.2,
    startStagingOffset: 2.4,
  },
  camera: {
    followOffset: new THREE.Vector3(0, 5.2, -9),
    sideCheckOffset: new THREE.Vector3(6.4, 2.2, 0),
    rearCheckOffset: new THREE.Vector3(0, 3.2, 5.6),
    raceTransitionDuration: 1.6,
    raceFollowSmoothness: 3.4,
    checkViewSmoothness: 5.8,
    raceLookAheadDistance: 7,
    rearLookBackDistance: 7,
    lookHeight: 1.1,
    sideLookHeight: 0.75,
    lookTargetSmoothness: 4.6,
  },
};
