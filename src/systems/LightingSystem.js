import * as THREE from 'three';
import { daylightConfig, shadowConfig } from '../config/sceneConfig.js';
import { EnvironmentMode } from './EnvironmentSystem.js';

export class LightingSystem {
  constructor(scene, config = daylightConfig) {
    this.scene = scene;
    this.config = config;

    this.hemisphereLight = new THREE.HemisphereLight();
    this.scene.add(this.hemisphereLight);

    this.mainLight = new THREE.DirectionalLight();
    this.mainLight.castShadow = true;
    this.mainLight.shadow.mapSize.set(shadowConfig.mapSize, shadowConfig.mapSize);
    this.mainLight.shadow.camera.left = -shadowConfig.cameraSize;
    this.mainLight.shadow.camera.right = shadowConfig.cameraSize;
    this.mainLight.shadow.camera.top = shadowConfig.cameraSize;
    this.mainLight.shadow.camera.bottom = -shadowConfig.cameraSize;
    this.mainLight.shadow.camera.near = shadowConfig.cameraNear;
    this.mainLight.shadow.camera.far = shadowConfig.cameraFar;
    this.mainLight.shadow.bias = shadowConfig.bias;
    this.scene.add(this.mainLight);

    this.applyEnvironment(EnvironmentMode.DAY);
  }

  applyEnvironment(mode) {
    const preset = mode === EnvironmentMode.NIGHT ? this.config.night : this.config.day;

    this.scene.background = new THREE.Color(preset.background);
    this.hemisphereLight.color.setHex(preset.hemisphere.skyColor);
    this.hemisphereLight.groundColor.setHex(preset.hemisphere.groundColor);
    this.hemisphereLight.intensity = preset.hemisphere.intensity;
    this.mainLight.color.setHex(preset.sun.color);
    this.mainLight.intensity = preset.sun.intensity;
    this.mainLight.position.copy(preset.sun.position);
  }
}
