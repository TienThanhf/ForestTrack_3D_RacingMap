import * as THREE from 'three';
import { rockConfig } from '../config/environmentConfig.js';

export class Rocks {
  constructor(sourceModel, raceTrack, config = rockConfig) {
    this.sourceModel = sourceModel;
    this.raceTrack = raceTrack;
    this.config = config;
    this.group = new THREE.Group();
    this.group.name = 'Rocks';

    this.createRocks();
  }

  createRocks() {
    // rock.glb loading: clone the imported rock once per configured decorative placement.
    this.config.placements.forEach((placement) => {
      const rock = this.sourceModel.clone(true);

      this.prepareRock(rock, placement);
      this.placeNearFenceGap(rock, placement);
      this.group.add(rock);
    });
  }

  prepareRock(rock, placement) {
    rock.scale.setScalar(placement.scale);
    rock.rotation.y = placement.rotation;
    rock.traverse((object) => {
      if (!object.isMesh) {
        return;
      }

      object.castShadow = true;
      object.receiveShadow = true;
    });
    rock.updateMatrixWorld(true);

    const bounds = new THREE.Box3().setFromObject(rock);
    if (!bounds.isEmpty()) {
      rock.position.y -= bounds.min.y;
    }
  }

  placeNearFenceGap(rock, placement) {
    const center = this.raceTrack.getPointAt(placement.t);
    const tangent = this.raceTrack.getTangentAt(placement.t);
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

    // Rock placement near fence gaps stays outside the road/curbs as visual-only decoration.
    rock.position.add(center)
      .addScaledVector(normal, placement.lateralOffset * placement.side);
    rock.position.y += this.raceTrack.surfaceHeight;
  }
}
