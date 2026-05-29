import * as THREE from 'three';
import { barrierConfig, curbConfig, shoulderLineConfig } from '../config/trackConfig.js';

export class Barriers {
  constructor(raceTrack, config = barrierConfig) {
    this.raceTrack = raceTrack;
    this.config = config;
    this.group = new THREE.Group();
    this.group.name = 'Barriers';

    this.createSegments();
  }

  createSegments() {
    const geometry = new THREE.BoxGeometry(
      this.config.width,
      this.config.height,
      this.config.length,
    );
    const material = new THREE.MeshLambertMaterial({ color: this.config.color });
    const lateralOffset = this.raceTrack.roadWidth / 2
      + shoulderLineConfig.roadEdgeGap
      + shoulderLineConfig.width
      + curbConfig.roadEdgeGap
      + curbConfig.width
      + this.config.curbGap
      + this.config.width / 2;
    const height = this.raceTrack.surfaceHeight + this.config.surfaceGap + this.config.height / 2;

    for (let index = 0; index < this.config.segmentCount; index += 1) {
      const t = index / this.config.segmentCount;
      const center = this.raceTrack.getPointAt(t);
      const tangent = this.raceTrack.getTangentAt(t);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      if (this.shouldPlaceSegment(t, 1)) {
        this.addSegment(geometry, material, center, tangent, normal, lateralOffset, height, 1);
      }

      if (this.shouldPlaceSegment(t, -1)) {
        this.addSegment(geometry, material, center, tangent, normal, lateralOffset, height, -1);
      }
    }
  }

  shouldPlaceSegment(t, side) {
    const opening = this.config.pitOpening;

    if (!opening || side !== opening.side) {
      return true;
    }

    return t < opening.startT || t > opening.endT;
  }

  addSegment(geometry, material, center, tangent, normal, lateralOffset, height, side) {
    const segment = new THREE.Mesh(geometry, material);

    segment.position.copy(center).addScaledVector(normal, lateralOffset * side);
    segment.position.y = height;
    segment.rotation.y = Math.atan2(tangent.x, tangent.z);
    segment.castShadow = true;
    segment.receiveShadow = true;

    this.group.add(segment);
  }
}
