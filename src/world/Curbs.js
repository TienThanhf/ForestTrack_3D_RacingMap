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
      1, // Base length of 1 to allow precise scaling
    );
    const redMaterial = new THREE.MeshLambertMaterial({ color: this.config.red });
    const yellowMaterial = new THREE.MeshLambertMaterial({ color: this.config.yellow });
    const lateralOffset = this.raceTrack.roadWidth / 2
      + shoulderLineConfig.roadEdgeGap
      + shoulderLineConfig.width
      + this.config.roadEdgeGap
      + this.config.width / 2;
    const height = this.raceTrack.surfaceHeight + this.config.surfaceGap + this.config.height / 2;

    // Alternating curb blocks trace both road edges without participating in collision.
    for (let index = 0; index < this.config.segmentCount; index += 1) {
      const t = index / this.config.segmentCount;
      const tNext = (index + 1) / this.config.segmentCount;

      const center = this.raceTrack.getPointAt(t);
      const tangent = this.raceTrack.getTangentAt(t);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      const centerNext = this.raceTrack.getPointAt(tNext);
      const tangentNext = this.raceTrack.getTangentAt(tNext);
      const normalNext = new THREE.Vector3(-tangentNext.z, 0, tangentNext.x).normalize();

      const material = index % 2 === 0 ? redMaterial : yellowMaterial;

      this.addSegment(geometry, material, center, normal, centerNext, normalNext, lateralOffset, height, 1);
      this.addSegment(geometry, material, center, normal, centerNext, normalNext, lateralOffset, height, -1);
    }
  }

  addSegment(geometry, material, center, normal, centerNext, normalNext, lateralOffset, height, side) {
    const segment = new THREE.Mesh(geometry, material);

    const pos = center.clone().addScaledVector(normal, lateralOffset * side);
    pos.y = height;

    const posNext = centerNext.clone().addScaledVector(normalNext, lateralOffset * side);
    posNext.y = height;

    const midpoint = new THREE.Vector3().addVectors(pos, posNext).multiplyScalar(0.5);
    segment.position.copy(midpoint);

    const dir = new THREE.Vector3().subVectors(posNext, pos);
    const distance = dir.length();
    dir.normalize();

    segment.rotation.y = Math.atan2(dir.x, dir.z);
    segment.scale.set(1, 1, distance);
    segment.castShadow = true;
    segment.receiveShadow = true;

    this.group.add(segment);
  }
}
