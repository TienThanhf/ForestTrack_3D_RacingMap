import * as THREE from 'three';
import {
  GREEN_CAR_WHEEL_NAMES,
  playerCarConfig,
} from '../config/vehicleConfig.js';

const WHEEL_KEYS = ['frontLeft', 'frontRight', 'rearLeft', 'rearRight'];
const FRONT_WHEEL_KEYS = ['frontLeft', 'frontRight'];
const DEFAULT_WHEEL_SPIN_AXIS = 'x';
const DEFAULT_STEERING_AXIS = 'y';

export function logHierarchy(object, depth = 0) {
  const indent = '  '.repeat(depth);
  const label = object.name || object.type || 'UnnamedObject';

  console.log(`${indent}${label}`);
  object.children.forEach((child) => logHierarchy(child, depth + 1));
}

export function collectCarWheels(carModel, wheelNames) {
  return {
    frontLeft: carModel.getObjectByName(wheelNames.frontLeft),
    frontRight: carModel.getObjectByName(wheelNames.frontRight),
    rearLeft: carModel.getObjectByName(wheelNames.rearLeft),
    rearRight: carModel.getObjectByName(wheelNames.rearRight),
  };
}

export class Car {
  constructor({ raceTrack, assetLoader, config = playerCarConfig }) {
    this.raceTrack = raceTrack;
    this.assetLoader = assetLoader;
    this.config = config;
    this.wheels = new Map();
    this.rollingWheels = [];
    this.fallbackWheels = [];
    this.frontSteeringPivots = new Map();
    this.headlights = [];
    this.headlightMaterials = [];
    this.activeCarId = config.defaultCarId || 'green';
    this.activeModel = null;
    this.group = new THREE.Group();
    this.group.name = 'PlayerCar';

    this.fallbackVisual = this.createFallbackVisual();
    this.fallbackVisual.userData.renderModeLabel = 'Primitive Car';
    this.createHeadlights();
    this.setHeadlightsEnabled(false);
    this.placeBeforeStartLine();
  }

  async initialize() {
    if (!this.assetLoader) {
      return;
    }

    try {
      await this.setActiveCar(this.activeCarId);
    } catch (error) {
      console.warn('Unable to load active car model; showing primitive fallback car.', error);
      this.showFallbackVisual();
    }
  }

  placeOnTrack(t) {
    const position = this.raceTrack.getPointAt(t);
    const tangent = this.raceTrack.getTangentAt(t);

    this.group.position.copy(position);
    this.group.position.y = this.raceTrack.surfaceHeight + this.config.verticalOffset;
    this.group.rotation.y = Math.atan2(tangent.x, tangent.z);
  }

  placeBeforeStartLine(
    t = this.config.startParameter,
    stagingOffset = this.config.startStagingOffset,
  ) {
    this.placeOnTrack(t);

    const tangent = this.raceTrack.getTangentAt(t);

    this.group.position.addScaledVector(tangent, -stagingOffset);
    this.group.position.y = this.getGroundY();
    this.group.rotation.x = 0;
    this.group.rotation.z = 0;
    this.resetSteeringVisuals();
  }

  getGroundY() {
    return this.raceTrack.surfaceHeight + this.config.verticalOffset;
  }

  getCarOptions() {
    return Object.values(this.config.carModels).map((definition) => ({
      id: definition.id,
      label: definition.label,
    }));
  }

  getActiveCarId() {
    return this.activeCarId;
  }

  async setActiveCar(carId) {
    const definition = this.getCarDefinition(carId);

    if (!definition || !this.assetLoader) {
      return false;
    }

    const gltf = await this.assetLoader.loadGltfIfAvailable(definition.modelPath);

    if (!gltf) {
      console.warn(`Unable to load ${definition.modelPath}; using primitive fallback car.`);
      this.showFallbackVisual();
      return false;
    }

    // Active car selection logic keeps one PlayerCar root so driving/collision/cameras stay intact.
    console.log(`${definition.label} hierarchy:`);
    logHierarchy(gltf.scene);
    this.useImportedModel(gltf.scene, definition);
    this.activeCarId = definition.id;

    return true;
  }

  getCarDefinition(carId) {
    return this.config.carModels[carId] || null;
  }

  useImportedModel(model, definition) {
    if (this.activeModel?.parent) {
      this.activeModel.parent.remove(this.activeModel);
    }

    this.clearWheelAnimationTargets();
    this.prepareImportedModel(model, definition, 'ImportedPlayerCar');
    this.hideFallbackVisual();
    this.group.add(model);
    this.activeModel = model;
    this.collectWheelNodes(model, definition);
  }

  async createParkedCar(carId, parkedTransform = null) {
    const definition = this.getCarDefinition(carId);

    if (!definition || !this.assetLoader) {
      return null;
    }

    const gltf = await this.assetLoader.loadGltfIfAvailable(definition.modelPath);

    if (!gltf) {
      console.warn(`Unable to load parked ${definition.label} from ${definition.modelPath}.`);
      return null;
    }

    // Parked cars use the same GLTF preparation as the active car.
    const root = new THREE.Group();
    root.name = `Parked_${definition.id}`;
    this.prepareImportedModel(gltf.scene, definition, `${definition.label}ParkedModel`);
    root.add(gltf.scene);

    const transform = parkedTransform || definition.parked;
    if (transform) {
      root.position.copy(transform.position);
      root.rotation.copy(transform.rotation);
    }

    return root;
  }

  prepareImportedModel(model, definition, name) {
    model.name = name;
    model.position.copy(definition.position || this.config.importedModel.position);
    model.rotation.copy(definition.rotation || this.config.importedModel.rotation);

    // Scale imported GLB cars from their authoring units so each fits the track/pit.
    model.scale.setScalar(definition.scale ?? this.config.importedModel.scale);
    this.placeModelOnWheelContactPlane(model);
    this.improveModelRenderingQuality(model);
  }

  placeModelOnWheelContactPlane(model) {
    model.updateMatrixWorld(true);

    const bounds = new THREE.Box3().setFromObject(model);

    if (!bounds.isEmpty()) {
      model.position.y -= bounds.min.y;
    }
  }

  improveModelRenderingQuality(root) {
    root.traverse((object) => {
      if (!object.isMesh) {
        return;
      }

      object.castShadow = true;
      object.receiveShadow = true;

      // Recompute normals and tune PBR material values without replacing model colors/textures.
      if (object.geometry?.attributes?.position) {
        object.geometry.computeVertexNormals();
        object.geometry.attributes.normal.needsUpdate = true;
      }

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      materials.filter(Boolean).forEach((material) => {
        if ('roughness' in material) {
          material.roughness = 0.45;
        }

        if ('metalness' in material) {
          material.metalness = 0.15;
        }

        material.needsUpdate = true;
      });
    });
  }

  getPrimitiveDemoGroup() {
    return this.fallbackVisual;
  }

  showFallbackVisual() {
    if (!this.fallbackVisual.parent) {
      this.group.add(this.fallbackVisual);
    }

    this.fallbackVisual.visible = true;
    this.rollingWheels = [...this.fallbackWheels];
  }

  hideFallbackVisual() {
    this.fallbackVisual.visible = false;

    if (this.fallbackVisual.parent) {
      this.fallbackVisual.parent.remove(this.fallbackVisual);
    }
  }

  clearWheelAnimationTargets() {
    this.wheels.clear();
    this.rollingWheels = [];
    this.frontSteeringPivots.clear();
  }

  collectWheelNodes(model, definition = {}) {
    this.clearWheelAnimationTargets();
    const wheelNames = definition.wheelNames || GREEN_CAR_WHEEL_NAMES;
    const collectedWheels = collectCarWheels(model, wheelNames);
    const carLabel = definition.label || 'car model';

    // Collect wheel parent nodes from the GLB. Each wheel owns its tire and rim meshes.
    WHEEL_KEYS.forEach((wheelKey) => {
      const wheel = collectedWheels[wheelKey];
      const wheelName = wheelNames[wheelKey];

      if (!wheel) {
        console.warn(`Wheel parent "${wheelName}" was not found for ${carLabel}.`);
        return;
      }

      this.wheels.set(wheelKey, wheel);
      this.rollingWheels.push(wheel);
      this.prepareWheelSpinState(wheel, definition);
      console.log(`Wheel parent found for ${carLabel}: ${wheelName}`);
    });

    FRONT_WHEEL_KEYS.forEach((wheelKey) => {
      const wheel = this.wheels.get(wheelKey);

      if (!wheel) {
        return;
      }

      this.frontSteeringPivots.set(wheelKey, this.createSteeringPivot(wheelKey, wheel, definition));
    });
  }

  prepareWheelSpinState(wheel, definition = {}) {
    if (!definition.preserveWheelBaseRotation) {
      return;
    }

    wheel.userData.baseWheelQuaternion = wheel.quaternion.clone();
    wheel.userData.spinAngle = 0;
    wheel.userData.spinAxis = definition.spinAxis || DEFAULT_WHEEL_SPIN_AXIS;
  }

  createSteeringPivot(name, wheel, definition = {}) {
    const parent = wheel.parent;
    const pivot = new THREE.Group();

    pivot.name = `SteerPivot_${name}`;
    pivot.position.copy(wheel.position);

    parent.add(pivot);
    pivot.attach(wheel);
    pivot.userData.steeringAxis = definition.steeringAxis || DEFAULT_STEERING_AXIS;

    if (definition.preserveWheelBaseRotation) {
      pivot.userData.baseSteeringQuaternion = pivot.quaternion.clone();
      wheel.userData.baseWheelQuaternion = wheel.quaternion.clone();
    }

    return pivot;
  }

  updateWheelAnimation({ speed, steeringAngle, deltaSeconds }) {
    const wheelConfig = this.config.wheel;

    // Wheel rolling is driven by traveled distance, so reversing naturally reverses spin.
    if (wheelConfig.radius > 0 && this.rollingWheels.length > 0) {
      const rotationAmount = (speed * deltaSeconds) / wheelConfig.radius;

      this.rollingWheels.forEach((wheel) => {
        this.rotateWheelAroundSpinAxis(wheel, rotationAmount);
      });
    }

    // Front wheel steering uses wrapper pivots so the wheel nodes can keep rolling.
    const clampedSteeringAngle = THREE.MathUtils.clamp(
      steeringAngle,
      -wheelConfig.maxSteeringAngle,
      wheelConfig.maxSteeringAngle,
    );

    this.frontSteeringPivots.forEach((pivot) => {
      const steeringAxis = pivot.userData.steeringAxis || DEFAULT_STEERING_AXIS;
      const nextAngle = THREE.MathUtils.damp(
        this.getAxisRotation(pivot, steeringAxis),
        clampedSteeringAngle,
        wheelConfig.steeringSmoothness,
        deltaSeconds,
      );

      this.setAxisRotation(pivot, steeringAxis, nextAngle);
    });
  }

  resetSteeringVisuals() {
    this.frontSteeringPivots.forEach((pivot) => {
      this.setAxisRotation(pivot, pivot.userData.steeringAxis || DEFAULT_STEERING_AXIS, 0);
    });
  }

  rotateWheelAroundSpinAxis(wheel, rotationAmount) {
    if (wheel.userData.baseWheelQuaternion) {
      wheel.userData.spinAngle = (wheel.userData.spinAngle || 0) + rotationAmount;
      wheel.quaternion.copy(wheel.userData.baseWheelQuaternion);
      wheel.quaternion.multiply(this.createAxisRotationQuaternion(
        wheel.userData.spinAxis || DEFAULT_WHEEL_SPIN_AXIS,
        wheel.userData.spinAngle,
      ));
      return;
    }

    wheel.rotation.x += rotationAmount;
  }

  createAxisRotationQuaternion(axis, angle) {
    const vector = axis === 'z'
      ? new THREE.Vector3(0, 0, 1)
      : axis === 'y'
        ? new THREE.Vector3(0, 1, 0)
        : new THREE.Vector3(1, 0, 0);

    return new THREE.Quaternion().setFromAxisAngle(vector, angle);
  }

  getAxisRotation(object, axis) {
    return axis === 'z'
      ? object.rotation.z
      : axis === 'y'
        ? object.rotation.y
        : object.rotation.x;
  }

  setAxisRotation(object, axis, angle) {
    if (object.userData.baseSteeringQuaternion) {
      object.quaternion.copy(object.userData.baseSteeringQuaternion);
      object.quaternion.multiply(this.createAxisRotationQuaternion(axis, angle));
      object.rotation.setFromQuaternion(object.quaternion);
      return;
    }

    if (axis === 'z') {
      object.rotation.z = angle;
    } else if (axis === 'y') {
      object.rotation.y = angle;
    } else {
      object.rotation.x = angle;
    }
  }

  createFallbackVisual() {
    const fallback = new THREE.Group();
    fallback.name = 'FallbackPlayerCar';

    this.addBody(fallback);
    this.addCabin(fallback);
    this.addWheels(fallback);

    return fallback;
  }

  createHeadlights() {
    const config = this.config.headlights;

    [
      config.leftPosition,
      config.rightPosition,
    ].forEach((position) => {
      const headlight = new THREE.SpotLight(
        config.color,
        config.nightIntensity,
        config.distance,
        config.angle,
        config.penumbra,
        config.decay,
      );
      const target = new THREE.Object3D();

      headlight.position.copy(position);
      headlight.castShadow = false;
      headlight.shadow.mapSize.set(512, 512);
      headlight.shadow.camera.near = 0.5;
      headlight.shadow.camera.far = config.distance;
      headlight.shadow.bias = -0.001;
      target.position.copy(position).add(config.targetOffset);
      headlight.target = target;

      this.group.add(headlight);
      this.group.add(target);
      this.headlights.push(headlight);
    });
  }

  setHeadlightsEnabled(enabled) {
    this.headlights.forEach((headlight) => {
      headlight.visible = enabled;
      headlight.intensity = enabled ? this.config.headlights.nightIntensity : 0;
      headlight.distance = this.config.headlights.distance;
      headlight.angle = this.config.headlights.angle;
      headlight.penumbra = this.config.headlights.penumbra;
      headlight.decay = this.config.headlights.decay;
      // Headlight shadow casting: enable at night for nearby scene objects.
      headlight.castShadow = enabled;
    });
    this.headlightMaterials.forEach((material) => {
      material.color.setHex(enabled
        ? this.config.headlights.lensNightColor
        : this.config.headlights.lensDayColor);
      material.emissive.setHex(enabled ? this.config.headlights.color : 0x000000);
      material.emissiveIntensity = enabled ? this.config.headlights.lensEmissiveIntensity : 0;
    });
  }

  addBody(root) {
    const { body, wheel } = this.config.fallback;
    const geometry = new THREE.BoxGeometry(body.width, body.height, body.length);
    const material = new THREE.MeshLambertMaterial({ color: body.color });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.name = 'FallbackCarBody';
    mesh.position.y = wheel.radius + body.height / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    root.add(mesh);
  }

  addCabin(root) {
    const { body, cabin, wheel } = this.config.fallback;
    const geometry = new THREE.BoxGeometry(cabin.width, cabin.height, cabin.length);
    const material = new THREE.MeshLambertMaterial({ color: cabin.color });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.name = 'FallbackCarCabin';
    mesh.position.set(0, wheel.radius + body.height + cabin.height / 2, -0.25);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    root.add(mesh);
  }

  addWheels(root) {
    const { body, wheel } = this.config.fallback;
    const geometry = new THREE.CylinderGeometry(
      wheel.radius,
      wheel.radius,
      wheel.depth,
      12,
    );
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: wheel.color });
    const hubMaterial = new THREE.MeshLambertMaterial({ color: wheel.hubColor });
    const wheelX = body.width / 2 + wheel.depth / 2 - 0.08;
    const wheelZ = body.length / 2 - 0.56;

    [
      [-wheelX, -wheelZ],
      [wheelX, -wheelZ],
      [-wheelX, wheelZ],
      [wheelX, wheelZ],
    ].forEach(([x, z], index) => {
      const wheelGroup = new THREE.Group();
      const tire = new THREE.Mesh(geometry, wheelMaterial);
      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(wheel.radius * 0.48, wheel.radius * 0.48, wheel.depth + 0.02, 12),
        hubMaterial,
      );

      wheelGroup.name = `FallbackCarWheel${index + 1}`;
      wheelGroup.position.set(x, wheel.radius, z);
      wheelGroup.rotation.z = Math.PI / 2;

      tire.castShadow = true;
      tire.receiveShadow = true;
      hub.castShadow = true;
      hub.receiveShadow = true;

      wheelGroup.add(tire);
      wheelGroup.add(hub);
      root.add(wheelGroup);
      this.fallbackWheels.push(wheelGroup);
    });
  }
}
