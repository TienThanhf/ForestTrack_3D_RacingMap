import * as THREE from 'three';
import { forestConfig } from '../config/environmentConfig.js';
import { groundConfig } from '../config/sceneConfig.js';

const WIND_CONFIG = {
  direction: new THREE.Vector2(0.65, 0.35).normalize(),
  clusterCellSize: 18,
  directionVariationDegrees: 7,
  amplitudeDegrees: {
    min: 4.7,
    max: 6.4,
  },
  localAmplitudeOffsetDegrees: {
    min: -0.55,
    max: 0.55,
  },
  speed: {
    min: 0.78,
    max: 1.02,
  },
  localSpeedOffset: {
    min: -0.05,
    max: 0.05,
  },
  clusterPhaseVariation: 0.26,
  wavePhaseSpacing: 0.42,
  localPhaseVariation: 0.18,
  directionalBiasDegrees: 0.5,
  staticLeanDegrees: 0.85,
};

export class Forest {
  constructor(raceTrack, exclusionProviders = [], config = forestConfig) {
    this.raceTrack = raceTrack;
    this.config = config;
    this.exclusionZones = exclusionProviders.flatMap((provider) => provider.getExclusionZones());
    this.group = new THREE.Group();
    this.group.name = 'Forest';
    this.animatedTrees = [];
    this.windClusters = new Map();

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

    // Seeded placement keeps trees stable while avoiding the road and start structures.
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

    const trunkGroup = new THREE.Group();
    trunkGroup.name = 'TreeTrunk';
    const swayGroup = new THREE.Group();
    swayGroup.name = 'TreeCanopySway';

    this.addTrunk(trunkGroup);
    this.addFoliage(swayGroup, foliageColor);

    tree.add(trunkGroup, swayGroup);
    this.registerTreeSway(tree, swayGroup, random);

    return tree;
  }

  registerTreeSway(tree, swayGroup, random) {
    const cluster = this.getOrCreateWindCluster(tree.position, random);
    const localWindDirection = cluster.windDirection.clone().rotateAround(
      new THREE.Vector2(0, 0),
      -tree.rotation.y,
    );
    const localAmplitudeOffset = THREE.MathUtils.degToRad(THREE.MathUtils.lerp(
      WIND_CONFIG.localAmplitudeOffsetDegrees.min,
      WIND_CONFIG.localAmplitudeOffsetDegrees.max,
      random(),
    ));
    const staticLean = THREE.MathUtils.degToRad(
      THREE.MathUtils.lerp(-WIND_CONFIG.staticLeanDegrees, WIND_CONFIG.staticLeanDegrees, random()),
    );
    const directionalBias = THREE.MathUtils.degToRad(WIND_CONFIG.directionalBiasDegrees);

    swayGroup.rotation.x = staticLean * localWindDirection.y;
    swayGroup.rotation.z = -staticLean * localWindDirection.x;

    swayGroup.userData.clusterWindDirection = cluster.windDirection;
    swayGroup.userData.clusterSwayAmplitude = cluster.swayAmplitude;
    swayGroup.userData.clusterSwaySpeed = cluster.swaySpeed;
    swayGroup.userData.clusterPhase = cluster.phase;
    swayGroup.userData.localAmplitudeOffset = localAmplitudeOffset;
    swayGroup.userData.localSpeedOffset = THREE.MathUtils.lerp(
      WIND_CONFIG.localSpeedOffset.min,
      WIND_CONFIG.localSpeedOffset.max,
      random(),
    );
    swayGroup.userData.localPhaseOffset = THREE.MathUtils.lerp(
      -WIND_CONFIG.localPhaseVariation,
      WIND_CONFIG.localPhaseVariation,
      random(),
    );
    swayGroup.userData.windInfluence = THREE.MathUtils.lerp(0.92, 1.04, random());
    swayGroup.userData.windDirectionX = localWindDirection.x;
    swayGroup.userData.windDirectionZ = localWindDirection.y;
    swayGroup.userData.directionalBias = directionalBias;
    swayGroup.userData.baseRotationX = swayGroup.rotation.x;
    swayGroup.userData.baseRotationZ = swayGroup.rotation.z;

    this.animatedTrees.push(swayGroup);
  }

  getOrCreateWindCluster(position, random) {
    const cellX = Math.floor(position.x / WIND_CONFIG.clusterCellSize);
    const cellZ = Math.floor(position.z / WIND_CONFIG.clusterCellSize);
    const clusterKey = `${cellX}:${cellZ}`;

    if (!this.windClusters.has(clusterKey)) {
      this.windClusters.set(clusterKey, this.createWindCluster(cellX, cellZ, random));
    }

    return this.windClusters.get(clusterKey);
  }

  createWindCluster(cellX, cellZ, random) {
    const directionVariation = THREE.MathUtils.degToRad(THREE.MathUtils.lerp(
      -WIND_CONFIG.directionVariationDegrees,
      WIND_CONFIG.directionVariationDegrees,
      random(),
    ));
    const windDirection = WIND_CONFIG.direction.clone().rotateAround(
      new THREE.Vector2(0, 0),
      directionVariation,
    );
    const wavePhase = (cellX * WIND_CONFIG.direction.x + cellZ * WIND_CONFIG.direction.y)
      * WIND_CONFIG.wavePhaseSpacing;
    const phaseVariation = THREE.MathUtils.lerp(
      -WIND_CONFIG.clusterPhaseVariation,
      WIND_CONFIG.clusterPhaseVariation,
      random(),
    );

    return {
      windDirection,
      swayAmplitude: THREE.MathUtils.degToRad(THREE.MathUtils.lerp(
        WIND_CONFIG.amplitudeDegrees.min,
        WIND_CONFIG.amplitudeDegrees.max,
        random(),
      )),
      swaySpeed: THREE.MathUtils.lerp(WIND_CONFIG.speed.min, WIND_CONFIG.speed.max, random()),
      phase: wavePhase + phaseVariation,
    };
  }

  update(timeSeconds) {
    for (let index = 0; index < this.animatedTrees.length; index += 1) {
      const swayGroup = this.animatedTrees[index];
      const {
        clusterSwayAmplitude,
        clusterSwaySpeed,
        clusterPhase,
        localAmplitudeOffset,
        localSpeedOffset,
        localPhaseOffset,
        windInfluence,
        windDirectionX,
        windDirectionZ,
        directionalBias,
        baseRotationX,
        baseRotationZ,
      } = swayGroup.userData;
      const swaySpeed = clusterSwaySpeed + localSpeedOffset;
      const swayAmplitude = clusterSwayAmplitude + localAmplitudeOffset;
      const swayPhase = clusterPhase + localPhaseOffset;
      const sway = Math.sin(timeSeconds * swaySpeed + swayPhase) * swayAmplitude * windInfluence;
      const bias = directionalBias * windInfluence;

      swayGroup.rotation.x = baseRotationX + (sway + bias) * windDirectionZ;
      swayGroup.rotation.z = baseRotationZ - (sway + bias) * windDirectionX;
    }
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
