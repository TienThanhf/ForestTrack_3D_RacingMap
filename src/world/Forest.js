import * as THREE from 'three';
import { forestConfig } from '../config/environmentConfig.js';
import { groundConfig } from '../config/sceneConfig.js';

export class Forest {
  constructor(raceTrack, exclusionProviders = [], config = forestConfig) {
    this.raceTrack = raceTrack;
    this.config = config;
    this.exclusionZones = exclusionProviders.flatMap((provider) => provider.getExclusionZones());
    this.group = new THREE.Group();
    this.group.name = 'Forest';

    this.trackSamples = this.createTrackSamples();
    this.createTrees();
  }

  createTrackSamples() {
    const samples = [];

    for (let index = 0; index < this.config.sampleCount; index += 1) {
      samples.push(this.raceTrack.getPointAt(index / this.config.sampleCount));
    }

    return samples;
  }

  createTrees() {
    const random = createSeededRandom(this.config.seed);
    const treePositions = [];
    const groundLimit = groundConfig.size / 2 - this.config.groundMargin;
    let attempts = 0;

    while (treePositions.length < this.config.treeCount && attempts < this.config.treeCount * 35) {
      attempts += 1;

      const position = new THREE.Vector3(
        THREE.MathUtils.lerp(-groundLimit, groundLimit, random()),
        0,
        THREE.MathUtils.lerp(-groundLimit, groundLimit, random()),
      );

      if (!this.isValidTreePosition(position, treePositions)) {
        continue;
      }

      treePositions.push(position);
      this.group.add(this.createTree(position, random));
    }
  }

  getDemoTree() {
    return this.group.children[0] || null;
  }

  isValidTreePosition(position, acceptedPositions) {
    if (this.distanceToTrack(position) < this.config.trackClearance) {
      return false;
    }

    if (this.isInsideExclusionZone(position)) {
      return false;
    }

    return acceptedPositions.every((acceptedPosition) => (
      acceptedPosition.distanceToSquared(position) >= this.config.minTreeSpacing ** 2
    ));
  }

  distanceToTrack(position) {
    return this.trackSamples.reduce((nearestDistance, sample) => {
      const distance = Math.hypot(position.x - sample.x, position.z - sample.z);

      return Math.min(nearestDistance, distance);
    }, Infinity);
  }

  isInsideExclusionZone(position) {
    return this.exclusionZones.some((zone) => {
      const offset = position.clone().sub(zone.center);
      const localWidth = offset.dot(zone.outward);
      const localLength = offset.dot(zone.tangent);
      const halfWidth = zone.halfWidth + this.config.structurePadding;
      const halfLength = zone.halfLength + this.config.structurePadding;

      return Math.abs(localWidth) <= halfWidth && Math.abs(localLength) <= halfLength;
    });
  }

  createTree(position, random) {
    const scale = THREE.MathUtils.lerp(
      this.config.scaleRange.min,
      this.config.scaleRange.max,
      random(),
    );
    const foliageColor = this.config.foliageColors[
      Math.floor(random() * this.config.foliageColors.length)
    ];
    const tree = new THREE.Group();

    tree.position.copy(position);
    tree.rotation.y = random() * Math.PI * 2;
    tree.scale.setScalar(scale);

    this.addTrunk(tree);
    this.addFoliage(tree, foliageColor);

    return tree;
  }

  addTrunk(tree) {
    const geometry = new THREE.CylinderGeometry(0.18, 0.26, 1.35, this.config.trunkSegments);
    const material = new THREE.MeshLambertMaterial({ color: this.config.trunkColor });
    const trunk = new THREE.Mesh(geometry, material);

    trunk.position.y = 0.68;
    trunk.castShadow = true;
    trunk.receiveShadow = true;

    tree.add(trunk);
  }

  addFoliage(tree, color) {
    const material = new THREE.MeshLambertMaterial({ color });
    const layers = [
      { radius: 1.15, height: 1.9, y: 1.75 },
      { radius: 0.92, height: 1.65, y: 2.45 },
      { radius: 0.68, height: 1.4, y: 3.02 },
    ];

    layers.forEach((layer) => {
      const geometry = new THREE.ConeGeometry(
        layer.radius,
        layer.height,
        this.config.foliageSegments,
      );
      const foliage = new THREE.Mesh(geometry, material);

      foliage.position.y = layer.y;
      foliage.castShadow = true;
      foliage.receiveShadow = true;

      tree.add(foliage);
    });
  }
}

function createSeededRandom(seed) {
  let state = seed;

  return () => {
    state = (state + 0x6d2b79f5) | 0;

    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
