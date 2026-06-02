import * as THREE from 'three';
import { startGateConfig } from '../config/environmentConfig.js';

export class StartGate {
  constructor(raceTrack, config = startGateConfig) {
    this.raceTrack = raceTrack;
    this.config = config;
    this.group = new THREE.Group();
    this.group.name = 'StartGate';
    this.roadLights = [];
    this.roadLightMaterials = [];

    this.anchor = this.getTrackAnchor(config.trackT, config.side);
    this.group.position.copy(this.anchor.position);
    this.group.rotation.y = Math.atan2(this.anchor.tangent.x, this.anchor.tangent.z);

    this.createGate();
    this.setNightEnabled(false);
  }

  getTrackAnchor(t, side) {
    const position = this.raceTrack.getPointAt(t);
    const tangent = this.raceTrack.getTangentAt(t);
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const outward = normal.clone().multiplyScalar(side);

    return { position, tangent, outward };
  }

  createGate() {
    const postGeometry = new THREE.BoxGeometry(
      this.config.postWidth,
      this.config.postHeight,
      this.config.postWidth,
    );
    const crossbarGeometry = new THREE.BoxGeometry(
      this.config.postOffset * 2 + this.config.postWidth,
      this.config.crossbarHeight,
      this.config.crossbarDepth,
    );
    const accentGeometry = new THREE.BoxGeometry(
      1.15,
      this.config.crossbarHeight + 0.04,
      this.config.crossbarDepth + 0.04,
    );
    const material = new THREE.MeshLambertMaterial({ color: this.config.color });
    const accentMaterial = new THREE.MeshLambertMaterial({ color: this.config.accentColor });

    [-1, 1].forEach((side) => {
      const post = new THREE.Mesh(postGeometry, material);

      post.position.set(side * this.config.postOffset, this.config.postHeight / 2, 0);
      post.castShadow = true;
      post.receiveShadow = true;

      this.group.add(post);
    });

    const crossbar = new THREE.Mesh(crossbarGeometry, material);
    crossbar.position.y = this.config.postHeight - this.config.crossbarHeight / 2;
    crossbar.castShadow = true;
    crossbar.receiveShadow = true;
    this.group.add(crossbar);

    [-2, 0, 2].forEach((slot) => {
      const accent = new THREE.Mesh(accentGeometry, accentMaterial);

      accent.position.set(slot * 1.4, crossbar.position.y + 0.01, 0);
      accent.castShadow = true;
      accent.receiveShadow = true;

      this.group.add(accent);
    });

    this.createRoadLights();
  }

  createRoadLights() {
    const lightConfig = this.config.roadLights;
    const lampY = this.config.postHeight - this.config.crossbarHeight - lightConfig.height / 2;
    const lampMaterial = new THREE.MeshStandardMaterial({
      color: lightConfig.color,
      emissive: lightConfig.color,
      emissiveIntensity: 0,
      roughness: 0.45,
    });
    const lampGeometry = new THREE.CylinderGeometry(
      lightConfig.radius,
      lightConfig.radius,
      lightConfig.height,
      12,
    );

    lightConfig.positions.forEach((x) => {
      // Visible lamp meshes on the start gate bar sit directly under the horizontal crossbar.
      const lamp = new THREE.Mesh(lampGeometry, lampMaterial.clone());
      lamp.position.set(x, lampY, 0);
      lamp.rotation.x = Math.PI / 2;
      lamp.castShadow = true;
      lamp.receiveShadow = true;
      this.group.add(lamp);
      this.roadLightMaterials.push(lamp.material);

      // Start gate downward road lights aim from the crossbar underside to the start-line road surface.
      const spotLight = new THREE.SpotLight(
        lightConfig.color,
        lightConfig.nightIntensity,
        lightConfig.distance,
        lightConfig.angle,
        lightConfig.penumbra,
        lightConfig.decay,
      );
      const target = new THREE.Object3D();

      spotLight.position.set(x, lampY - lightConfig.height / 2, 0);
      target.position.set(x, lightConfig.surfaceTargetY, 0);
      spotLight.target = target;
      spotLight.castShadow = false;

      this.group.add(spotLight);
      this.group.add(target);
      this.roadLights.push(spotLight);
    });
  }

  setNightEnabled(enabled) {
    const lightConfig = this.config.roadLights;

    // Day/night intensity update for start gate lights follows the existing environment switch.
    this.roadLights.forEach((light) => {
      light.visible = enabled;
      light.intensity = enabled ? lightConfig.nightIntensity : lightConfig.dayIntensity;
    });
    this.roadLightMaterials.forEach((material) => {
      material.emissiveIntensity = enabled ? 1.4 : 0;
    });
  }

  getExclusionZones() {
    return [
      {
        center: this.anchor.position,
        tangent: this.anchor.tangent,
        outward: this.anchor.outward,
        halfWidth: this.config.postOffset + this.config.clearancePadding,
        halfLength: this.config.crossbarDepth + this.config.clearancePadding,
      },
    ];
  }
}
