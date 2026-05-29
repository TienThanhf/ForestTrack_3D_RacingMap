import * as THREE from 'three';
import { trackConfig } from '../config/trackConfig.js';

export class RaceTrack {
  constructor(config = trackConfig) {
    this.roadWidth = config.roadWidth;
    this.sampleCount = config.sampleCount;
    this.surfaceHeight = config.surfaceHeight;
    this.curve = new THREE.CatmullRomCurve3(config.controlPoints, true, 'catmullrom', 0.5);

    this.mesh = this.createRoadMesh(config.color);
  }

  getPointAt(t) {
    return this.curve.getPointAt(t);
  }

  getTangentAt(t) {
    return this.curve.getTangentAt(t).normalize();
  }

  createRoadMesh(color) {
    const geometry = this.createRoadGeometry();
    const material = new THREE.MeshLambertMaterial({ color });
    const road = new THREE.Mesh(geometry, material);

    road.name = 'RaceTrack';
    road.receiveShadow = true;

    return road;
  }

  createRoadGeometry() {
    const vertices = [];
    const indices = [];
    const halfWidth = this.roadWidth / 2;

    for (let index = 0; index < this.sampleCount; index += 1) {
      const t = index / this.sampleCount;
      const center = this.getPointAt(t);
      const tangent = this.getTangentAt(t);
      const leftNormal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const leftEdge = center.clone().addScaledVector(leftNormal, halfWidth);
      const rightEdge = center.clone().addScaledVector(leftNormal, -halfWidth);

      vertices.push(leftEdge.x, this.surfaceHeight, leftEdge.z);
      vertices.push(rightEdge.x, this.surfaceHeight, rightEdge.z);
    }

    for (let index = 0; index < this.sampleCount; index += 1) {
      const nextIndex = (index + 1) % this.sampleCount;
      const left = index * 2;
      const right = left + 1;
      const nextLeft = nextIndex * 2;
      const nextRight = nextLeft + 1;

      indices.push(left, nextLeft, right);
      indices.push(right, nextLeft, nextRight);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }
}
