import * as THREE from 'three';
import { shoulderLineConfig } from '../config/trackConfig.js';

export class RoadShoulders {
  constructor(raceTrack, config = shoulderLineConfig) {
    this.raceTrack = raceTrack;
    this.config = config;
    this.group = new THREE.Group();
    this.group.name = 'RoadShoulders';

    this.createShoulderLines();
  }

  createShoulderLines() {
    const material = new THREE.MeshLambertMaterial({
      color: this.config.color,
      side: THREE.DoubleSide,
    });

    this.group.add(this.createShoulderLine(material, 1));
    this.group.add(this.createShoulderLine(material, -1));
  }

  createShoulderLine(material, side) {
    const geometry = this.createShoulderGeometry(side);
    const line = new THREE.Mesh(geometry, material);

    line.name = side > 0 ? 'InnerShoulderLine' : 'OuterShoulderLine';
    line.receiveShadow = true;

    return line;
  }

  createShoulderGeometry(side) {
    const vertices = [];
    const indices = [];
    const baseOffset = this.raceTrack.roadWidth / 2 + this.config.roadEdgeGap;
    const outerOffset = baseOffset + this.config.width;
    const height = this.raceTrack.surfaceHeight + this.config.surfaceGap;

    for (let index = 0; index < this.raceTrack.sampleCount; index += 1) {
      const t = index / this.raceTrack.sampleCount;
      const center = this.raceTrack.getPointAt(t);
      const tangent = this.raceTrack.getTangentAt(t);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const innerEdge = center.clone().addScaledVector(normal, baseOffset * side);
      const outerEdge = center.clone().addScaledVector(normal, outerOffset * side);

      vertices.push(innerEdge.x, height, innerEdge.z);
      vertices.push(outerEdge.x, height, outerEdge.z);
    }

    for (let index = 0; index < this.raceTrack.sampleCount; index += 1) {
      const nextIndex = (index + 1) % this.raceTrack.sampleCount;
      const near = index * 2;
      const far = near + 1;
      const nextNear = nextIndex * 2;
      const nextFar = nextNear + 1;

      indices.push(near, nextNear, far);
      indices.push(far, nextNear, nextFar);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }
}
