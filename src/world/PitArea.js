import * as THREE from 'three';
import { pitAreaConfig } from '../config/environmentConfig.js';

export class PitArea {
  constructor(raceTrack, config = pitAreaConfig) {
    this.raceTrack = raceTrack;
    this.config = config;
    this.group = new THREE.Group();
    this.group.name = 'PitArea';

    this.anchor = this.getTrackAnchor(config.trackT, config.side, config.lateralOffset);
    this.group.position.copy(this.anchor.position);
    this.group.rotation.y = Math.atan2(this.anchor.tangent.x, this.anchor.tangent.z);

    this.createPlatform();
    this.createPosts();
    this.createRoof();
    this.createSignboard();
  }

  getTrackAnchor(t, side, lateralOffset) {
    const center = this.raceTrack.getPointAt(t);
    const tangent = this.raceTrack.getTangentAt(t);
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const outward = normal.clone().multiplyScalar(side);
    const position = center.clone().addScaledVector(outward, lateralOffset);

    return { center, tangent, outward, position };
  }

  createPlatform() {
    const geometry = new THREE.BoxGeometry(
      this.config.platform.width,
      this.config.platform.height,
      this.config.platform.length,
    );
    const material = new THREE.MeshLambertMaterial({ color: this.config.platform.color });
    const platform = new THREE.Mesh(geometry, material);

    platform.position.y = this.config.platform.height / 2;
    platform.castShadow = true;
    platform.receiveShadow = true;

    this.group.add(platform);
  }

  createPosts() {
    const geometry = new THREE.CylinderGeometry(
      this.config.posts.radius,
      this.config.posts.radius,
      this.config.posts.height,
      6,
    );
    const material = new THREE.MeshLambertMaterial({ color: this.config.posts.color });
    const postX = this.config.platform.width / 2 - 0.55;
    const postZ = this.config.platform.length / 2 - 0.7;

    [
      [-postX, -postZ],
      [postX, -postZ],
      [-postX, postZ],
      [postX, postZ],
    ].forEach(([x, z]) => {
      const post = new THREE.Mesh(geometry, material);

      post.position.set(x, this.config.platform.height + this.config.posts.height / 2, z);
      post.castShadow = true;
      post.receiveShadow = true;

      this.group.add(post);
    });
  }

  createRoof() {
    const geometry = new THREE.BoxGeometry(
      this.config.roof.width,
      this.config.roof.height,
      this.config.roof.length,
    );
    const material = new THREE.MeshLambertMaterial({ color: this.config.roof.color });
    const roof = new THREE.Mesh(geometry, material);

    roof.position.y = this.config.roof.y;
    roof.castShadow = true;
    roof.receiveShadow = true;

    this.group.add(roof);
  }

  createSignboard() {
    const geometry = new THREE.BoxGeometry(
      this.config.sign.width,
      this.config.sign.height,
      this.config.sign.depth,
    );
    const material = new THREE.MeshLambertMaterial({ color: this.config.sign.color });
    const sign = new THREE.Mesh(geometry, material);

    sign.position.set(
      -this.config.platform.width / 2 - 0.08,
      this.config.platform.height + 1.25,
      0,
    );
    sign.castShadow = true;
    sign.receiveShadow = true;

    this.group.add(sign);
  }

  getExclusionZones() {
    const padding = this.config.clearancePadding;

    return [
      {
        center: this.anchor.position,
        tangent: this.anchor.tangent,
        outward: this.anchor.outward,
        halfWidth: this.config.roof.width / 2 + padding,
        halfLength: this.config.roof.length / 2 + padding,
      },
    ];
  }
}
