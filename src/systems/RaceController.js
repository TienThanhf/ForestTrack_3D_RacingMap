import * as THREE from 'three';
import { raceModeConfig } from '../config/raceConfig.js';

export const RaceCameraMode = Object.freeze({
  NORMAL: 'normal',
  SIDE_CHECK: 'sideCheck',
  REAR_CHECK: 'rearCheck',
});

export class RaceController {
  constructor({ car, camera, inputController, config = raceModeConfig }) {
    this.car = car;
    this.camera = camera;
    this.inputController = inputController;
    this.config = config;
    this.speed = 0;
    this.forward = new THREE.Vector3();
    this.desiredCameraPosition = new THREE.Vector3();
    this.desiredLookTarget = new THREE.Vector3();
    this.currentLookTarget = new THREE.Vector3();
    this.transitionStartPosition = new THREE.Vector3();
    this.transitionStartLookTarget = new THREE.Vector3();
    this.transitionElapsed = 0;
    this.transitionActive = false;
    this.cameraMode = RaceCameraMode.NORMAL;
    this.heldCameraModes = new Set();
    this.visualSteeringAngle = 0;
    this.raceStateListeners = new Set();
    this.selectedLapCount = config.raceTimer.defaultLapCount;
    this.completedLaps = 0;
    this.elapsedSeconds = 0;
    this.timeTrialEnabled = false;
    this.timerRunning = false;
    this.raceFinished = false;
    this.resultDismissed = false;
    this.wasInsideStartTrigger = false;

    this.updateDesiredCameraFrame();
    this.currentLookTarget.copy(this.desiredLookTarget);
    this.resetRaceSession();
  }

  resetInputState() {
    this.speed = 0;
    this.visualSteeringAngle = 0;
    this.cameraMode = RaceCameraMode.NORMAL;
    this.heldCameraModes.clear();
    this.inputController.clearDrivingActions();
  }

  getSpeed() {
    return this.speed;
  }

  update(deltaSeconds) {
    const input = this.inputController.getDrivingActions();

    this.updateSpeed(input, deltaSeconds);
    this.updateVisualSteering(input, deltaSeconds);
    this.updateSteering(input, deltaSeconds);
    this.updatePosition(deltaSeconds);
    this.car.updateWheelAnimation({
      speed: this.speed,
      steeringAngle: this.visualSteeringAngle,
      deltaSeconds,
    });
    this.updateRaceTimer(deltaSeconds);
    this.updateFollowCamera(deltaSeconds);
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

  updateVisualSteering(input, deltaSeconds) {
    const steerDirection = Number(input.steerLeft) - Number(input.steerRight);
    const targetAngle = THREE.MathUtils.clamp(
      steerDirection * this.car.config.wheel.maxSteeringAngle,
      -this.car.config.wheel.maxSteeringAngle,
      this.car.config.wheel.maxSteeringAngle,
    );

    this.visualSteeringAngle = THREE.MathUtils.damp(
      this.visualSteeringAngle,
      targetAngle,
      this.car.config.wheel.steeringSmoothness,
      deltaSeconds,
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
    this.applyTrackBoundary();
    this.car.group.position.y = this.car.getGroundY();
    this.car.group.rotation.x = 0;
    this.car.group.rotation.z = 0;
  }

  setLapCount(lapCount) {
    const allowed = this.config.raceTimer.lapOptions;
    const nextLapCount = Number(lapCount);

    if (!allowed.includes(nextLapCount)) {
      return;
    }

    // Lap count selection UI updates the pending race and returns to practice mode.
    this.selectedLapCount = nextLapCount;
    this.resetRaceSession();
  }

  resetRaceSession() {
    this.resetCarToStagedStart();
    this.completedLaps = 0;
    this.elapsedSeconds = 0;
    this.timeTrialEnabled = false;
    this.timerRunning = false;
    this.raceFinished = false;
    this.resultDismissed = false;
    this.wasInsideStartTrigger = this.isInsideStartTrigger();
    this.notifyRaceState();
  }

  startTimeTrial() {
    this.resetCarForTimedStart();
    // Optional time trial mode: practice driving never starts timing until the player arms a timed run.
    this.completedLaps = 0;
    this.elapsedSeconds = 0;
    this.timeTrialEnabled = true;
    this.timerRunning = false;
    this.raceFinished = false;
    this.resultDismissed = false;
    // Waiting-for-start-line state is armed here; the first clean crossing starts the clock.
    this.wasInsideStartTrigger = this.isInsideStartTrigger();
    this.notifyRaceState();
  }

  resetCarForTimedStart() {
    this.resetInputState();
    this.resetCarToStagedStart();

    this.transitionActive = false;
    this.updateDesiredCameraFrame();
    this.currentLookTarget.copy(this.desiredLookTarget);
    this.cameraMode = RaceCameraMode.NORMAL;
    this.camera.position.copy(this.desiredCameraPosition);
    this.camera.lookAt(this.currentLookTarget);
  }

  resetCarToStagedStart() {
    const timerConfig = this.config.raceTimer;
    const stagingOffset = timerConfig.startStagingOffset || timerConfig.triggerDepth;

    // Practice and timed sessions both stage just before the timing line for a clean first crossing.
    this.car.placeBeforeStartLine(timerConfig.startLineT, stagingOffset);
    this.updateDesiredCameraFrame();
    this.currentLookTarget.copy(this.desiredLookTarget);
  }

  closeResultPanel() {
    this.resultDismissed = true;
    this.notifyRaceState();
  }

  updateRaceTimer(deltaSeconds) {
    if (!this.timeTrialEnabled && !this.timerRunning) {
      // Practice mode behavior: crossings are ignored, so free driving never increments laps or results.
      return;
    }

    if (this.timerRunning && !this.raceFinished) {
      this.elapsedSeconds += deltaSeconds;
    }

    const isInsideStartTrigger = this.isInsideStartTrigger();

    // Timer start logic and lap counting require a fresh entry into the start/finish trigger.
    if (isInsideStartTrigger && !this.wasInsideStartTrigger) {
      this.handleStartLineCrossing();
    }

    this.wasInsideStartTrigger = isInsideStartTrigger;
    this.notifyRaceState();
  }

  handleStartLineCrossing() {
    if (this.raceFinished || !this.timeTrialEnabled) {
      return;
    }

    if (!this.timerRunning) {
      // Timer start logic: the first clean crossing starts the clock without counting a lap.
      this.timerRunning = true;
      this.elapsedSeconds = 0;
      return;
    }

    // Lap counting logic: every later clean crossing completes one lap.
    this.completedLaps += 1;

    if (this.completedLaps >= this.selectedLapCount) {
      this.completedLaps = this.selectedLapCount;
      this.timerRunning = false;
      this.timeTrialEnabled = false;
      this.raceFinished = true;
    }
  }

  isInsideStartTrigger() {
    const timerConfig = this.config.raceTimer;
    const center = this.car.raceTrack.getPointAt(timerConfig.startLineT);
    const tangent = this.car.raceTrack.getTangentAt(timerConfig.startLineT);
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const offset = new THREE.Vector3().subVectors(this.car.group.position, center);
    const alongTrack = offset.dot(tangent);
    const acrossTrack = offset.dot(normal);
    const halfDepth = timerConfig.triggerDepth / 2;
    const halfWidth = this.car.raceTrack.roadWidth / 2 + timerConfig.triggerWidthPadding;

    // Start/finish trigger: invisible box around the painted line, debounced by wasInsideStartTrigger.
    return Math.abs(alongTrack) <= halfDepth && Math.abs(acrossTrack) <= halfWidth;
  }

  getRaceState() {
    const currentLap = (!this.timeTrialEnabled && !this.raceFinished)
      ? 0
      : this.raceFinished
      ? this.selectedLapCount
      : Math.min(this.completedLaps + (this.timerRunning ? 1 : 0), this.selectedLapCount);
    const status = this.raceFinished
      ? 'finished'
      : this.timerRunning
        ? 'running'
        : this.timeTrialEnabled
          ? 'waiting'
          : 'practice';

    return {
      lapOptions: [...this.config.raceTimer.lapOptions],
      selectedLapCount: this.selectedLapCount,
      currentLap,
      completedLaps: this.completedLaps,
      elapsedSeconds: this.elapsedSeconds,
      timeTrialEnabled: this.timeTrialEnabled,
      timerRunning: this.timerRunning,
      raceFinished: this.raceFinished,
      resultDismissed: this.resultDismissed,
      status,
    };
  }

  subscribeRaceState(listener) {
    this.raceStateListeners.add(listener);
    listener(this.getRaceState());

    return () => this.raceStateListeners.delete(listener);
  }

  notifyRaceState() {
    const state = this.getRaceState();

    this.raceStateListeners.forEach((listener) => listener(state));
  }

  applyTrackBoundary() {
    const driving = this.config.driving;
    const beforeClamp = this.car.group.position.clone();

    // Simple curve-based collision keeps the car on the drivable road, independent of rail meshes.
    this.car.raceTrack.clampPointToDriveableRoad(
      this.car.group.position,
      driving.roadBoundaryPadding,
    );

    if (beforeClamp.distanceToSquared(this.car.group.position) > 0.0001) {
      this.speed *= driving.offTrackSpeedRetention;
    }
  }

  startCameraTransition(startLookTarget) {
    this.transitionActive = true;
    this.transitionElapsed = 0;
    this.transitionStartPosition.copy(this.camera.position);
    this.transitionStartLookTarget.copy(startLookTarget || this.desiredLookTarget);
    this.currentLookTarget.copy(this.transitionStartLookTarget);
    this.updateDesiredCameraFrame();
  }

  updateFollowCamera(deltaSeconds) {
    const cameraConfig = this.config.camera;

    // Side/rear hold-to-view camera shortcuts are active only while Q/E are held.
    this.cameraMode = this.getHeldCameraMode();
    this.updateDesiredCameraFrame();

    if (this.transitionActive) {
      this.transitionElapsed += deltaSeconds;
      const duration = cameraConfig.raceTransitionDuration || 1.6;
      const progress = THREE.MathUtils.clamp(this.transitionElapsed / duration, 0, 1);
      const easedProgress = THREE.MathUtils.smoothstep(progress, 0, 1);

      this.camera.position.lerpVectors(
        this.transitionStartPosition,
        this.desiredCameraPosition,
        easedProgress,
      );
      this.currentLookTarget.lerpVectors(
        this.transitionStartLookTarget,
        this.desiredLookTarget,
        easedProgress,
      );
      this.camera.lookAt(this.currentLookTarget);

      if (progress >= 1) {
        this.transitionActive = false;
      }

      return;
    }

    this.dampVector(
      this.camera.position,
      this.desiredCameraPosition,
      this.cameraMode === RaceCameraMode.NORMAL
        ? cameraConfig.raceFollowSmoothness || 3.4
        : cameraConfig.checkViewSmoothness || 5.8,
      deltaSeconds,
    );
    this.dampVector(
      this.currentLookTarget,
      this.desiredLookTarget,
      cameraConfig.lookTargetSmoothness || 4.6,
      deltaSeconds,
    );
    this.camera.lookAt(this.currentLookTarget);
  }

  updateDesiredCameraFrame() {
    const cameraConfig = this.config.camera;

    this.car.group.getWorldDirection(this.forward);
    this.forward.y = 0;
    this.forward.normalize();

    const localOffset = this.getActiveCameraOffset().applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.car.group.rotation.y,
    );

    this.desiredCameraPosition.copy(this.car.group.position).add(localOffset);
    this.desiredLookTarget.copy(this.car.group.position);

    if (this.cameraMode === RaceCameraMode.SIDE_CHECK) {
      this.desiredLookTarget.y += cameraConfig.sideLookHeight || cameraConfig.lookHeight;
    } else if (this.cameraMode === RaceCameraMode.REAR_CHECK) {
      this.desiredLookTarget.addScaledVector(
        this.forward,
        -(cameraConfig.rearLookBackDistance || 7),
      );
      this.desiredLookTarget.y += cameraConfig.lookHeight;
    } else {
      this.desiredLookTarget.addScaledVector(
        this.forward,
        cameraConfig.raceLookAheadDistance || cameraConfig.lookAheadDistance,
      );
      this.desiredLookTarget.y += cameraConfig.lookHeight;
    }
  }

  getActiveCameraOffset() {
    const cameraConfig = this.config.camera;

    if (this.cameraMode === RaceCameraMode.SIDE_CHECK) {
      return cameraConfig.sideCheckOffset.clone();
    }

    if (this.cameraMode === RaceCameraMode.REAR_CHECK) {
      return cameraConfig.rearCheckOffset.clone();
    }

    return cameraConfig.followOffset.clone();
  }

  setHeldCameraCheck(mode, active) {
    if (
      mode !== RaceCameraMode.SIDE_CHECK
      && mode !== RaceCameraMode.REAR_CHECK
    ) {
      return;
    }

    if (active) {
      this.heldCameraModes.add(mode);
    } else {
      this.heldCameraModes.delete(mode);
    }

    this.transitionActive = false;
  }

  getHeldCameraMode() {
    if (this.heldCameraModes.has(RaceCameraMode.SIDE_CHECK)) {
      return RaceCameraMode.SIDE_CHECK;
    }

    if (this.heldCameraModes.has(RaceCameraMode.REAR_CHECK)) {
      return RaceCameraMode.REAR_CHECK;
    }

    return RaceCameraMode.NORMAL;
  }

  dampVector(current, target, smoothness, deltaSeconds) {
    current.set(
      THREE.MathUtils.damp(current.x, target.x, smoothness, deltaSeconds),
      THREE.MathUtils.damp(current.y, target.y, smoothness, deltaSeconds),
      THREE.MathUtils.damp(current.z, target.z, smoothness, deltaSeconds),
    );
  }
}
