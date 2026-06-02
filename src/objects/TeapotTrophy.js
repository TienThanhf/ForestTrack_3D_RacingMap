import * as THREE from 'three';
import { TeapotGeometry } from 'three/addons/geometries/TeapotGeometry.js';
import { teapotTrophyConfig } from '../config/environmentConfig.js';

const UP_AXIS = new THREE.Vector3(0, 1, 0);

export class TeapotTrophy {
  constructor({ pitArea, config = teapotTrophyConfig }) {
    this.config = config;
    this.group = new THREE.Group();
    this.group.name = 'TeapotTrophy';

    this.createPedestal();
    this.createTeapot();
    this.placeBehindPitShelter(pitArea);
  }

  createPedestal() {
    const { pedestal } = this.config;
    const geometry = new THREE.CylinderGeometry(
      pedestal.radius,
      pedestal.radius * 1.08,
      pedestal.height,
      pedestal.segments,
    );
    const material = new THREE.MeshLambertMaterial({ color: pedestal.color });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.name = 'TeapotPedestal';
    mesh.position.y = pedestal.height / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.group.add(mesh);
  }

  createTeapot() {
    const geometry = new TeapotGeometry(
      this.config.size,
      this.config.segments,
      true,
      true,
      true,
      true,
      true,
    );
    const material = new THREE.MeshLambertMaterial({
      color: this.config.color,
      emissive: this.config.accentColor,
      emissiveIntensity: 0.04,
      flatShading: true,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.name = 'LowPolyTeapot';
    mesh.position.y = this.config.pedestal.height + this.config.size;
    mesh.rotation.y = Math.PI / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.group.add(mesh);
  }

  placeBehindPitShelter(pitArea) {
    const worldPosition = this.config.localPosition
      .clone()
      .applyAxisAngle(UP_AXIS, pitArea.group.rotation.y)
      .add(pitArea.group.position);

    this.group.position.copy(worldPosition);
    this.group.rotation.y = pitArea.group.rotation.y + this.config.rotationY;
  }
}
