import * as THREE from 'three';
import { trackConfig } from '../config/trackConfig.js';

export class RaceTrack {
  constructor(config = trackConfig) {
    this.roadWidth = config.roadWidth;
    this.sampleCount = config.sampleCount;
    this.surfaceHeight = config.surfaceHeight;
    this.curve = new THREE.CatmullRomCurve3(config.controlPoints, true, 'catmullrom', 0.5);
    this.collisionSamples = this.createCollisionSamples();

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
    // Road material color update: dark gray asphalt stays readable in day and night.
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.92,
      metalness: 0.02,
      map: this.createAsphaltTexture(),
    });
    const road = new THREE.Mesh(geometry, material);

    road.name = 'RaceTrack';
    road.receiveShadow = true;

    return road;
  }

  createAsphaltTexture() {
    const canvas = document.createElement('canvas');
    const size = 128;
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    const imageData = context.createImageData(size, size);

    for (let index = 0; index < imageData.data.length; index += 4) {
      const pixel = index / 4;
      const noise = Math.floor(38 + this.hashNoise(pixel) * 34);

      imageData.data[index] = noise;
      imageData.data[index + 1] = noise + 2;
      imageData.data[index + 2] = noise + 4;
      imageData.data[index + 3] = 255;
    }

    context.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(18, 18);
    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
  }

  hashNoise(value) {
    const next = Math.sin(value * 12.9898 + 78.233) * 43758.5453;

    return next - Math.floor(next);
  }

  createRoadGeometry() {
    const vertices = [];
    const indices = [];
    const halfWidth = this.roadWidth / 2;

    // The road follows a sampled CatmullRomCurve3, giving a playable multi-turn loop.
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

  createCollisionSamples() {
    const samples = [];

    for (let index = 0; index < this.sampleCount; index += 1) {
      const t = index / this.sampleCount;
      const center = this.getPointAt(t);
      const tangent = this.getTangentAt(t);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      samples.push({ center, tangent, normal });
    }

    return samples;
  }

  getClosestRoadFrame(position) {
    return this.collisionSamples.reduce((closest, sample) => {
      const distanceSq = (position.x - sample.center.x) ** 2
        + (position.z - sample.center.z) ** 2;

      if (!closest || distanceSq < closest.distanceSq) {
        return { ...sample, distanceSq };
      }

      return closest;
    }, null);
  }

  clampPointToDriveableRoad(position, padding = 0.45) {
    const frame = this.getClosestRoadFrame(position);

    if (!frame) {
      return position;
    }

    const offset = new THREE.Vector3().subVectors(position, frame.center);
    const lateralDistance = offset.dot(frame.normal);
    const maxLateralDistance = this.roadWidth / 2 - padding;

    if (Math.abs(lateralDistance) <= maxLateralDistance) {
      return position;
    }

    position.addScaledVector(
      frame.normal,
      THREE.MathUtils.clamp(lateralDistance, -maxLateralDistance, maxLateralDistance)
        - lateralDistance,
    );

    return position;
  }
}
