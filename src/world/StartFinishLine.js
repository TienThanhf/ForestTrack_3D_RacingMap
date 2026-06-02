import * as THREE from 'three';
import { startFinishConfig } from '../config/trackConfig.js';

export class StartFinishLine {
  constructor(raceTrack, config = startFinishConfig) {
    this.raceTrack = raceTrack;
    this.config = config;
    this.group = new THREE.Group();
    this.group.name = 'StartFinishLine';

    this.createCheckeredLine();
  }

  createCheckeredLine() {
    const lightMaterial = new THREE.MeshBasicMaterial({ color: this.config.lightColor });
    const darkMaterial = new THREE.MeshBasicMaterial({ color: this.config.darkColor });
    const totalWidth = this.raceTrack.roadWidth - this.config.widthPadding;
    const cellWidth = totalWidth / this.config.stripeColumns;
    const cellDepth = this.config.stripeDepth / this.config.stripeRows;

    // Start/finish markings are low boxes just above the road so they stay visible at night.
    for (let row = 0; row < this.config.stripeRows; row += 1) {
      for (let column = 0; column < this.config.stripeColumns; column += 1) {
        const material = (row + column) % 2 === 0 ? lightMaterial : darkMaterial;
        const lateralOffset = -totalWidth / 2 + cellWidth * (column + 0.5);
        const longitudinalOffset = -this.config.stripeDepth / 2 + cellDepth * (row + 0.5);

        this.addStripeCell(material, lateralOffset, longitudinalOffset, cellWidth, cellDepth);
      }
    }
  }

  addStripeCell(material, lateralOffset, longitudinalOffset, width, depth) {
    const center = this.raceTrack.getPointAt(this.config.trackT);
    const tangent = this.raceTrack.getTangentAt(this.config.trackT);
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const geometry = new THREE.BoxGeometry(width, this.config.stripeHeight, depth);
    const cell = new THREE.Mesh(geometry, material);

    cell.position.copy(center)
      .addScaledVector(normal, lateralOffset)
      .addScaledVector(tangent, longitudinalOffset);
    cell.position.y = this.raceTrack.surfaceHeight
      + this.config.surfaceGap
      + this.config.stripeHeight / 2;
    cell.rotation.y = Math.atan2(tangent.x, tangent.z);
    cell.receiveShadow = true;

    this.group.add(cell);
  }
}
