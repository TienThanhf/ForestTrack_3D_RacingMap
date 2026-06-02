import * as THREE from 'three';
import { roadDecorationConfig } from '../config/trackConfig.js';

export class RoadDecorations {
  constructor(raceTrack, config = roadDecorationConfig) {
    this.raceTrack = raceTrack;
    this.config = config;
    this.group = new THREE.Group();
    this.group.name = 'RoadDecorations';

    this.createRoadSurfaceVariation();
    this.createRoadArrows();
  }

  createRoadSurfaceVariation() {
    const height = this.raceTrack.surfaceHeight + this.config.surfaceGap;

    this.config.variation.patches.forEach((patch, index) => {
      const geometry = new THREE.BoxGeometry(patch.width, patch.patchHeight ?? this.config.variation.patchHeight, patch.length);
      const material = new THREE.MeshBasicMaterial({
        color: patch.color,
        transparent: true,
        opacity: patch.opacity,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geometry, material);

      mesh.name = `AsphaltVariationPatch${index + 1}`;
      this.placeOnRoad(mesh, patch.t, patch.lateralOffset, height + geometry.parameters.height / 2);
      mesh.castShadow = false;
      mesh.receiveShadow = false;

      this.group.add(mesh);
    });
  }

  createRoadArrows() {
    const geometry = this.createArrowGeometry();
    const material = new THREE.MeshBasicMaterial({
      color: this.config.arrows.color,
      transparent: true,
      opacity: this.config.arrows.opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const height = this.raceTrack.surfaceHeight + this.config.surfaceGap + 0.018;

    this.config.arrows.placements.forEach((placement, index) => {
      const arrow = new THREE.Mesh(geometry, material);

      arrow.name = `RoadDirectionArrow${index + 1}`;
      this.placeOnRoad(arrow, placement.t, placement.lateralOffset, height, {
        longitudinalOffset: placement.longitudinalOffset ?? 0,
        rotationOffset: placement.rotationOffset ?? 0,
      });
      arrow.castShadow = false;
      arrow.receiveShadow = false;

      this.group.add(arrow);
    });
  }

  createArrowGeometry() {
    const { width, length, shaftWidth, headBase } = this.config.arrows;
    const shaftHalfWidth = shaftWidth / 2;
    const halfLength = length / 2;
    const headBaseZ = halfLength - length * headBase;

    const vertices = [
      -shaftHalfWidth, 0, -halfLength,
      shaftHalfWidth, 0, -halfLength,
      shaftHalfWidth, 0, headBaseZ,
      -shaftHalfWidth, 0, headBaseZ,
      -width / 2, 0, headBaseZ,
      0, 0, halfLength,
      width / 2, 0, headBaseZ,
    ];
    const indices = [
      0, 1, 2,
      0, 2, 3,
      4, 6, 5,
    ];
    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }

  placeOnRoad(object, t, lateralOffset, y, options = {}) {
    const center = this.raceTrack.getPointAt(t);
    const tangent = this.raceTrack.getTangentAt(t);
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

    object.position.copy(center)
      .addScaledVector(normal, lateralOffset)
      .addScaledVector(tangent, options.longitudinalOffset ?? 0);
    object.position.y = y;
    object.rotation.y = Math.atan2(tangent.x, tangent.z) + (options.rotationOffset ?? 0);
  }
}
