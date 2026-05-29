import * as THREE from 'three';
import { startGateConfig } from '../config/environmentConfig.js';

export class StartGate {
  constructor(raceTrack, config = startGateConfig) {
    this.raceTrack = raceTrack;
    this.config = config;
    this.group = new THREE.Group();
    this.group.name = 'StartGate';

    this.anchor = this.getTrackAnchor(config.trackT, config.side);
    this.group.position.copy(this.anchor.position);
    this.group.rotation.y = Math.atan2(this.anchor.tangent.x, this.anchor.tangent.z);

    this.createGate();
  }

  getTrackAnchor(t, side) {
    const position = this.raceTrack.getPointAt(t);
    const tangent = this.raceTrack.getTangentAt(t);
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const outward = normal.clone().multiplyScalar(side);

    return { position, tangent, outward };
  }

  createGate() {
    const postGeometry = new THREE.BoxGeometry(
      this.config.postWidth,
      this.config.postHeight,
      this.config.postWidth,
    );
    const crossbarGeometry = new THREE.BoxGeometry(
      this.config.postOffset * 2 + this.config.postWidth,
      this.config.crossbarHeight,
      this.config.crossbarDepth,
    );
    const accentGeometry = new THREE.BoxGeometry(
      1.15,
      this.config.crossbarHeight + 0.04,
      this.config.crossbarDepth + 0.04,
    );
    const material = new THREE.MeshLambertMaterial({ color: this.config.color });
    const accentMaterial = new THREE.MeshLambertMaterial({ color: this.config.accentColor });

    [-1, 1].forEach((side) => {
      const post = new THREE.Mesh(postGeometry, material);

      post.position.set(side * this.config.postOffset, this.config.postHeight / 2, 0);
      post.castShadow = true;
      post.receiveShadow = true;

      this.group.add(post);
    });

    const crossbar = new THREE.Mesh(crossbarGeometry, material);
    crossbar.position.y = this.config.postHeight - this.config.crossbarHeight / 2;
    crossbar.castShadow = true;
    crossbar.receiveShadow = true;
    this.group.add(crossbar);

    [-2, 0, 2].forEach((slot) => {
      const accent = new THREE.Mesh(accentGeometry, accentMaterial);

      accent.position.set(slot * 1.4, crossbar.position.y + 0.01, 0);
      accent.castShadow = true;
      accent.receiveShadow = true;

      this.group.add(accent);
    });
  }

  getExclusionZones() {
    return [
      {
        center: this.anchor.position,
        tangent: this.anchor.tangent,
        outward: this.anchor.outward,
        halfWidth: this.config.postOffset + this.config.clearancePadding,
        halfLength: this.config.crossbarDepth + this.config.clearancePadding,
      },
    ];
  }
}
