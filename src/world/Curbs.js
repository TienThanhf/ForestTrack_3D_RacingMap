import * as THREE from 'three';
import { curbConfig, shoulderLineConfig } from '../config/trackConfig.js';

export class Curbs {
  constructor(raceTrack, config = curbConfig) {
    this.raceTrack = raceTrack;
    this.config = config;
    this.group = new THREE.Group();
    this.group.name = 'Curbs';

    this.createSegments();
  }

  createSegments() {
    const geometry = new THREE.BoxGeometry(
      this.config.width,
      this.config.height,
      this.config.length,
    );
    const redMaterial = new THREE.MeshLambertMaterial({ color: this.config.red });
    const yellowMaterial = new THREE.MeshLambertMaterial({ color: this.config.yellow });
    const lateralOffset = this.raceTrack.roadWidth / 2
      + shoulderLineConfig.roadEdgeGap
      + shoulderLineConfig.width
      + this.config.roadEdgeGap
      + this.config.width / 2;
    const height = this.raceTrack.surfaceHeight + this.config.surfaceGap + this.config.height / 2;

    for (let index = 0; index < this.config.segmentCount; index += 1) {
      const t = index / this.config.segmentCount;
      const center = this.raceTrack.getPointAt(t);
      const tangent = this.raceTrack.getTangentAt(t);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const material = index % 2 === 0 ? redMaterial : yellowMaterial;

      this.addSegment(geometry, material, center, tangent, normal, lateralOffset, height, 1);
      this.addSegment(geometry, material, center, tangent, normal, lateralOffset, height, -1);
    }
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
