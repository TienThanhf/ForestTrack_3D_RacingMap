import * as THREE from 'three';
import { playerCarConfig } from '../config/vehicleConfig.js';

export class Car {
  constructor({ raceTrack, assetLoader, config = playerCarConfig }) {
    this.raceTrack = raceTrack;
    this.assetLoader = assetLoader;
    this.config = config;
    this.wheels = [];
    this.headlights = [];
    this.headlightMaterials = [];
    this.group = new THREE.Group();
    this.group.name = 'PlayerCar';

    this.fallbackVisual = this.createFallbackVisual();
    this.fallbackVisual.userData.renderModeLabel = 'Primitive Car';
    this.group.add(this.fallbackVisual);
    this.createHeadlights();
    this.setHeadlightsEnabled(false);
    this.placeOnTrack(config.startParameter);
  }

  async initialize() {
    if (!this.assetLoader) {
      return;
    }

    try {
      const gltf = await this.assetLoader.loadGltfIfAvailable(this.config.modelPath);

      if (!gltf) {
        return;
      }

      this.useImportedModel(gltf.scene);
    } catch {
      this.fallbackVisual.visible = true;
    }
  }

  placeOnTrack(t) {
    const position = this.raceTrack.getPointAt(t);
    const tangent = this.raceTrack.getTangentAt(t);

    this.group.position.copy(position);
    this.group.position.y = this.raceTrack.surfaceHeight + this.config.verticalOffset;
    this.group.rotation.y = Math.atan2(tangent.x, tangent.z);
  }

  getGroundY() {
    return this.raceTrack.surfaceHeight + this.config.verticalOffset;
  }

  useImportedModel(model) {
    this.configureModelShadows(model);

    model.name = 'ImportedPlayerCar';
    model.position.copy(this.config.importedModel.position);
    model.rotation.copy(this.config.importedModel.rotation);
    model.scale.setScalar(this.config.importedModel.scale);

    this.fallbackVisual.visible = false;
    this.group.add(model);
  }

  configureModelShadows(root) {
    root.traverse((object) => {
      if (!object.isMesh) {
        return;
      }

      object.castShadow = true;
      object.receiveShadow = true;
    });
  }

  getPrimitiveDemoGroup() {
    return this.fallbackVisual;
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
    const lensGeometry = new THREE.SphereGeometry(config.lensRadius, 8, 6);

    [
      config.leftPosition,
      config.rightPosition,
    ].forEach((position) => {
      const lensMaterial = new THREE.MeshStandardMaterial({
        color: config.lensDayColor,
        emissive: 0x000000,
        roughness: 0.5,
      });
      const lens = new THREE.Mesh(lensGeometry, lensMaterial);
      const headlight = new THREE.SpotLight(
        config.color,
        config.intensity,
        config.distance,
        config.angle,
        config.penumbra,
        config.decay,
      );
      const target = new THREE.Object3D();

      lens.position.copy(position);
      lens.castShadow = false;
      lens.receiveShadow = true;
      headlight.position.copy(position);
      headlight.castShadow = false;
      target.position.copy(position).add(config.targetOffset);
      headlight.target = target;

      this.group.add(lens);
      this.group.add(headlight);
      this.group.add(target);
      this.headlights.push(headlight);
      this.headlightMaterials.push(lensMaterial);
    });
  }

  setHeadlightsEnabled(enabled) {
    this.headlights.forEach((headlight) => {
      headlight.visible = enabled;
      headlight.intensity = enabled ? this.config.headlights.intensity : 0;
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
      this.wheels.push(wheelGroup);
    });
  }
}
