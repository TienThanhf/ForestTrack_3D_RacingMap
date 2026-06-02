import * as THREE from 'three';
import { billboardConfig } from '../config/environmentConfig.js';

export class Billboard {
  constructor(raceTrack, config = billboardConfig) {
    this.raceTrack = raceTrack;
    this.config = config;
    this.group = new THREE.Group();
    this.group.name = 'ForestTrackLogoBillboard';
    this.logoMaterial = null;

    this.anchor = this.getTrackAnchor(config.placement);
    this.group.position.copy(this.anchor.position);
    this.group.rotation.y = this.anchor.rotationY;

    this.createPoles();
    this.createPanel();
    this.setNightEnabled(false);
  }

  getTrackAnchor(placement) {
    const center = this.raceTrack.getPointAt(placement.t);
    const tangent = this.raceTrack.getTangentAt(placement.t);
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const outward = normal.clone().multiplyScalar(placement.side);
    const inward = outward.clone().multiplyScalar(-1);
    const position = center.clone().addScaledVector(outward, placement.lateralOffset);
    const rotationY = Math.atan2(inward.x, inward.z) + (placement.rotationOffset ?? 0);

    return {
      center,
      tangent,
      outward,
      position,
      rotationY,
    };
  }

  createPoles() {
    const { poles } = this.config;
    const geometry = new THREE.CylinderGeometry(
      poles.radius,
      poles.radius,
      poles.height,
      12,
    );
    const material = new THREE.MeshStandardMaterial({
      color: poles.color,
      roughness: poles.roughness,
      metalness: poles.metalness,
    });

    [-1, 1].forEach((side) => {
      const pole = new THREE.Mesh(geometry, material);

      pole.name = `BillboardSupportPole${side < 0 ? 'Left' : 'Right'}`;
      pole.position.set(side * poles.spacing / 2, poles.height / 2, 0);
      pole.castShadow = true;
      pole.receiveShadow = true;

      this.group.add(pole);
    });
  }

  createPanel() {
    const { panel } = this.config;
    const geometry = new THREE.BoxGeometry(panel.width, panel.height, panel.depth);
    const materials = this.createPanelMaterials();
    const mesh = new THREE.Mesh(geometry, materials);

    mesh.name = 'ForestTrackLogoBillboardPanel';
    mesh.position.y = panel.bottomHeight + panel.height / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.group.add(mesh);
  }

  createPanelMaterials() {
    const { panel } = this.config;
    const sideMaterial = new THREE.MeshStandardMaterial({
      color: panel.sideColor,
      roughness: panel.roughness,
      metalness: panel.metalness,
    });
    const backMaterial = new THREE.MeshStandardMaterial({
      color: panel.backColor,
      roughness: panel.roughness,
      metalness: panel.metalness,
    });
    const logoMaterial = new THREE.MeshStandardMaterial({
      color: panel.frontColor,
      emissive: panel.frontColor,
      emissiveIntensity: panel.dayEmissiveIntensity ?? 0.25,
      roughness: panel.roughness,
      metalness: panel.metalness,
    });
    const texture = new THREE.TextureLoader().load(
      this.config.logoPath,
      (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.anisotropy = 8;
        loadedTexture.needsUpdate = true;
      },
      undefined,
      (error) => {
        console.warn(`Unable to load billboard texture ${this.config.logoPath}.`, error);
      },
    );

    texture.colorSpace = THREE.SRGBColorSpace;
    logoMaterial.map = texture;
    logoMaterial.emissiveMap = texture;
    this.logoMaterial = logoMaterial;

    // BoxGeometry material order is right, left, top, bottom, front, back.
    return [
      sideMaterial,
      sideMaterial,
      sideMaterial,
      sideMaterial,
      logoMaterial,
      backMaterial,
    ];
  }

  setNightEnabled(enabled) {
    const { panel } = this.config;

    if (this.logoMaterial) {
      this.logoMaterial.emissiveIntensity = enabled
        ? panel.nightEmissiveIntensity ?? 0.8
        : panel.dayEmissiveIntensity ?? 0.25;
    }
  }

  getExclusionZones() {
    const { panel, exclusionPadding } = this.config;

    return [
      {
        center: this.anchor.position,
        tangent: this.anchor.tangent,
        outward: this.anchor.outward,
        halfWidth: panel.depth / 2 + exclusionPadding.width,
        halfLength: panel.width / 2 + exclusionPadding.length,
      },
    ];
  }
}
