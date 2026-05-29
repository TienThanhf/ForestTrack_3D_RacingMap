import * as THREE from 'three';
import { raceModeConfig } from '../config/raceConfig.js';

export class RaceController {
  constructor({ car, camera, inputController, config = raceModeConfig }) {
    this.car = car;
    this.camera = camera;
    this.inputController = inputController;
    this.config = config;
    this.speed = 0;
    this.forward = new THREE.Vector3();
    this.desiredCameraPosition = new THREE.Vector3();
    this.lookTarget = new THREE.Vector3();
  }

  resetInputState() {
    this.speed = 0;
    this.inputController.clearDrivingActions();
  }

  update(deltaSeconds) {
    const input = this.inputController.getDrivingActions();

    this.updateSpeed(input, deltaSeconds);
    this.updateSteering(input, deltaSeconds);
    this.updatePosition(deltaSeconds);
    this.updateFollowCamera();
  }

  updateSpeed(input, deltaSeconds) {
    const driving = this.config.driving;

    if (input.accelerate) {
      this.speed += driving.acceleration * deltaSeconds;
    } else if (input.brake) {
      const deceleration = this.speed > 0 ? driving.brakeDeceleration : driving.reverseAcceleration;
      this.speed -= deceleration * deltaSeconds;
    } else {
      this.applyFriction(deltaSeconds);
    }

    this.speed = THREE.MathUtils.clamp(
      this.speed,
      -driving.maxReverseSpeed,
      driving.maxForwardSpeed,
    );
  }

  applyFriction(deltaSeconds) {
    const frictionStep = this.config.driving.friction * deltaSeconds;

    if (Math.abs(this.speed) <= frictionStep) {
      this.speed = 0;
      return;
    }

    this.speed -= Math.sign(this.speed) * frictionStep;
  }

  updateSteering(input, deltaSeconds) {
    const steerDirection = Number(input.steerLeft) - Number(input.steerRight);

    if (steerDirection === 0 || this.speed === 0) {
      return;
    }

    const driving = this.config.driving;
    const speedRatio = Math.min(Math.abs(this.speed) / driving.maxForwardSpeed, 1);
    const steeringInfluence = THREE.MathUtils.lerp(
      driving.steeringSpeedInfluence,
      1,
      speedRatio,
    );
    const reverseDirection = this.speed < 0 ? -1 : 1;

    this.car.group.rotation.y += (
      steerDirection
      * reverseDirection
      * driving.steeringRate
      * steeringInfluence
      * deltaSeconds
    );
  }

  updatePosition(deltaSeconds) {
    if (this.speed === 0) {
      return;
    }

    this.car.group.getWorldDirection(this.forward);
    this.forward.y = 0;
    this.forward.normalize();
    this.car.group.position.addScaledVector(this.forward, this.speed * deltaSeconds);
    this.car.group.position.y = this.car.getGroundY();
    this.car.group.rotation.x = 0;
    this.car.group.rotation.z = 0;
  }

  updateFollowCamera() {
    const cameraConfig = this.config.camera;

    this.car.group.getWorldDirection(this.forward);
    this.forward.y = 0;
    this.forward.normalize();

    const localOffset = cameraConfig.followOffset.clone().applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.car.group.rotation.y,
    );

    this.desiredCameraPosition.copy(this.car.group.position).add(localOffset);
    this.lookTarget.copy(this.car.group.position)
      .addScaledVector(this.forward, cameraConfig.lookAheadDistance);
    this.lookTarget.y += cameraConfig.lookHeight;

    this.camera.position.lerp(this.desiredCameraPosition, cameraConfig.positionSmoothing);
    this.camera.lookAt(this.lookTarget);
  }
}
