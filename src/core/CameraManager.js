import * as THREE from 'three';
import { cameraConfig } from '../config/sceneConfig.js';

export class CameraManager {
  constructor(width, height) {
    this.config = cameraConfig;
    this.defaults = {
      position: cameraConfig.position.clone(),
      target: cameraConfig.target.clone(),
      fieldOfView: cameraConfig.fieldOfView,
      nearPlane: cameraConfig.nearPlane,
      farPlane: cameraConfig.farPlane,
    };
    this.camera = new THREE.PerspectiveCamera(
      cameraConfig.fieldOfView,
      width / height,
      cameraConfig.nearPlane,
      cameraConfig.farPlane,
    );

    this.camera.position.copy(cameraConfig.position);
    this.camera.lookAt(cameraConfig.target);
  }

  resetToExploreView() {
    this.camera.position.copy(this.defaults.position);
    this.camera.fov = this.defaults.fieldOfView;
    this.camera.near = this.defaults.nearPlane;
    this.camera.far = this.defaults.farPlane;
    this.camera.lookAt(this.defaults.target);
    this.camera.updateProjectionMatrix();
  }

  setExplorePosition({ x, y, z }) {
    this.camera.position.set(x, y, z);
  }

  setPerspective({ fieldOfView, nearPlane, farPlane }) {
    const nextNear = Math.max(0.01, nearPlane);
    const nextFar = Math.max(nextNear + 1, farPlane);

    this.camera.fov = THREE.MathUtils.clamp(fieldOfView, 25, 85);
    this.camera.near = nextNear;
    this.camera.far = nextFar;
    this.camera.updateProjectionMatrix();
  }

  getCameraState() {
    return {
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z,
      fieldOfView: this.camera.fov,
      nearPlane: this.camera.near,
      farPlane: this.camera.far,
    };
  }

  resize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
