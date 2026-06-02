import * as THREE from 'three';
import { streetLampConfig } from '../config/environmentConfig.js';

export class ImportedStreetLight {
  constructor(sourceModel, { raceTrack, placement, config = streetLampConfig }) {
    this.config = config;
    this.group = new THREE.Group();
    this.group.name = 'ImportedStreetLight';
    this.model = sourceModel.clone(true);
    this.spotLight = null;
    this.lightTarget = null;
    this.roadTargetPosition = new THREE.Vector3();

    this.prepareModel();
    this.placeOnTrackEdge(raceTrack, placement);
    this.createRoadLight();
    this.setNightEnabled(false);
  }

  prepareModel() {
    // streetlight.glb loading: clone the imported model and enable shadows on all meshes.
    this.model.scale.setScalar(this.config.modelScale);
    this.model.traverse((object) => {
      if (!object.isMesh) {
        return;
      }

      object.castShadow = true;
      object.receiveShadow = true;
    });
    this.model.updateMatrixWorld(true);

    const bounds = new THREE.Box3().setFromObject(this.model);
    if (!bounds.isEmpty()) {
      this.model.position.y -= bounds.min.y;
    }

    this.group.add(this.model);
  }

  placeOnTrackEdge(raceTrack, placement) {
    const center = raceTrack.getPointAt(placement.t);
    const tangent = raceTrack.getTangentAt(placement.t);
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const outward = normal.clone().multiplyScalar(placement.side);
    const inward = outward.clone().negate();

    // Street light placement/distribution: fixed track parameters keep lamps balanced and outside road/curbs.
    this.group.position.copy(center).addScaledVector(
      normal,
      placement.lateralOffset * placement.side,
    );
    this.group.position.y = raceTrack.surfaceHeight;

    // Street light orientation: local -Z aims at the road, leaving the pole head outward from the edge.
    this.group.rotation.y = Math.atan2(-inward.x, -inward.z);
    this.roadTargetPosition.copy(center).addScaledVector(
      outward,
      raceTrack.roadWidth / 2 - this.config.lightTargetRoadOffset,
    );
    this.roadTargetPosition.y = raceTrack.surfaceHeight;
  }

  createRoadLight() {
    this.spotLight = new THREE.SpotLight(
      this.config.lightColor,
      this.config.nightIntensity,
      this.config.lightDistance,
      this.config.lightAngle,
      this.config.lightPenumbra,
      this.config.lightDecay,
    );
    this.lightTarget = new THREE.Object3D();

    this.spotLight.position.set(0, this.config.lightHeight, 0);
    this.group.updateMatrixWorld(true);
    // Street light orientation/downward light target: aim each SpotLight from the pole down to the road.
    this.lightTarget.position.copy(this.group.worldToLocal(this.roadTargetPosition.clone()));
    this.spotLight.target = this.lightTarget;
    this.spotLight.castShadow = true;
    this.configureLampShadow(this.spotLight);

    this.group.add(this.spotLight);
    this.group.add(this.lightTarget);
  }

  configureLampShadow(light) {
    const shadow = this.config.shadow;

    light.shadow.mapSize.set(shadow.mapSize, shadow.mapSize);
    light.shadow.camera.near = shadow.cameraNear;
    light.shadow.camera.far = this.config.lightDistance;
    light.shadow.bias = shadow.bias;
    light.shadow.normalBias = shadow.normalBias;
    light.shadow.radius = shadow.radius;
    light.shadow.camera.updateProjectionMatrix();
  }

  setNightEnabled(enabled) {
    if (!this.spotLight) {
      return;
    }

    // Night mode street light intensity: warm spotlights brighten only the road-facing lamp cones.
    this.spotLight.visible = enabled;
    this.spotLight.castShadow = enabled;
    this.spotLight.intensity = enabled
      ? this.config.nightIntensity
      : this.config.dayIntensity;
  }

  getDemoGroup() {
    return this.group;
  }
}
