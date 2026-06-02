import * as THREE from 'three';
import { streetLampConfig } from '../config/environmentConfig.js';

export class StreetLamp {
  constructor(config = streetLampConfig) {
    this.config = config;
    this.group = new THREE.Group();
    this.group.name = 'StreetLamp';
    this.bulbMaterial = null;
    this.pointLight = null;
    this.demoGroup = new THREE.Group();
    this.demoGroup.name = 'StreetLampGeometry';

    this.createBase();
    this.createPole();
    this.createLampHead();
    this.setNightEnabled(false);
  }

  createBase() {
    const geometry = new THREE.CylinderGeometry(
      this.config.baseRadius,
      this.config.baseRadius * 1.15,
      0.18,
      8,
    );
    const material = new THREE.MeshLambertMaterial({ color: this.config.baseColor });
    const base = new THREE.Mesh(geometry, material);

    base.position.y = 0.09;
    base.castShadow = true;
    base.receiveShadow = true;

    this.demoGroup.add(base);
    this.group.add(this.demoGroup);
  }

  createPole() {
    const geometry = new THREE.CylinderGeometry(
      this.config.poleRadius,
      this.config.poleRadius,
      this.config.poleHeight,
      8,
    );
    const material = new THREE.MeshLambertMaterial({ color: this.config.poleColor });
    const pole = new THREE.Mesh(geometry, material);

    pole.position.y = this.config.poleHeight / 2;
    pole.castShadow = true;
    pole.receiveShadow = true;

    this.demoGroup.add(pole);
  }

  createLampHead() {
    const armGeometry = new THREE.BoxGeometry(0.7, 0.09, 0.09);
    const poleMaterial = new THREE.MeshLambertMaterial({ color: this.config.poleColor });
    const arm = new THREE.Mesh(armGeometry, poleMaterial);

    arm.position.set(0.24, this.config.poleHeight, 0);
    arm.castShadow = true;
    arm.receiveShadow = true;

    const bulbGeometry = new THREE.SphereGeometry(this.config.bulbRadius, 10, 8);
    this.bulbMaterial = new THREE.MeshStandardMaterial({
      color: this.config.bulbDayColor,
      emissive: 0x000000,
      roughness: 0.7,
    });
    const bulb = new THREE.Mesh(bulbGeometry, this.bulbMaterial);

    bulb.position.copy(this.config.headOffset);
    bulb.castShadow = true;
    bulb.receiveShadow = true;

    this.pointLight = new THREE.PointLight(
      this.config.lightColor,
      this.config.lightIntensity,
      this.config.lightDistance,
      this.config.lightDecay,
    );
    this.pointLight.position.copy(this.config.headOffset);
    // Night lighting adjustment: street lamps cast local shadows on the road/ground.
    this.pointLight.castShadow = true;
    this.configureLampShadow(this.pointLight);

    this.demoGroup.add(arm);
    this.demoGroup.add(bulb);
    this.group.add(this.pointLight);
  }

  configureLampShadow(light) {
    const shadow = this.config.shadow;

    light.shadow.mapSize.set(shadow.mapSize, shadow.mapSize);
    light.shadow.camera.near = shadow.cameraNear;
    light.shadow.camera.far = this.config.lightDistance;
    light.shadow.bias = shadow.bias;
    light.shadow.normalBias = shadow.normalBias;
    light.shadow.radius = shadow.radius;
    light.shadow.camera.updateProjectionMatrix();
  }

  getDemoGroup() {
    return this.demoGroup;
  }

  setNightEnabled(enabled) {
    if (!this.bulbMaterial || !this.pointLight) {
      return;
    }

    this.pointLight.visible = enabled;
    this.pointLight.castShadow = enabled;
    this.pointLight.intensity = enabled ? this.config.lightIntensity : 0;
    this.bulbMaterial.color.setHex(enabled ? this.config.bulbNightColor : this.config.bulbDayColor);
    this.bulbMaterial.emissive.setHex(enabled ? this.config.bulbEmissiveColor : 0x000000);
    this.bulbMaterial.emissiveIntensity = enabled ? this.config.bulbEmissiveIntensity : 0;
  }
}
