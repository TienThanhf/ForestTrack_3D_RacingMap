import * as THREE from 'three';
import { barrierConfig, curbConfig, shoulderLineConfig } from '../config/trackConfig.js';

export class Barriers {
  constructor(raceTrack, config = barrierConfig) {
    this.raceTrack = raceTrack;
    this.config = config;
    this.group = new THREE.Group();
    this.group.name = 'Barriers';
    this.segmentFootprints = [];

    this.createSegments();
  }

  createSegments() {
    const postGeometry = new THREE.BoxGeometry(
      this.config.postWidth,
      this.config.height,
      this.config.postWidth,
    );
    const railGeometry = new THREE.BoxGeometry(
      this.config.width,
      this.config.railThickness,
      this.config.length,
    );
    const postMaterial = new THREE.MeshLambertMaterial({ color: this.config.postColor });
    const railMaterial = new THREE.MeshLambertMaterial({ color: this.config.railColor });
    const lateralOffset = this.raceTrack.roadWidth / 2
      + shoulderLineConfig.roadEdgeGap
      + shoulderLineConfig.width
      + curbConfig.roadEdgeGap
      + curbConfig.width
      + this.config.curbGap
      + this.config.width / 2;
    const height = this.raceTrack.surfaceHeight + this.config.surfaceGap + this.config.height / 2;
    this.segmentFootprints = [];

    // Lightweight guard rails follow both sides, with an opening for the pit lane area.
    for (let index = 0; index < this.config.segmentCount; index += 1) {
      const t = index / this.config.segmentCount;
      const tNext = (index + 1) / this.config.segmentCount;

      // Build per-side segments, handling corners with fillet arcs.
      [1, -1].forEach((side) => {
        if (!this.shouldPlaceSegment(t, side)) {
          return;
        }

        this.buildSideSegment(
          postGeometry, railGeometry, postMaterial, railMaterial,
          t, tNext, lateralOffset, height, side,
        );
      });
    }
  }

  buildSideSegment(postGeometry, railGeometry, postMaterial, railMaterial, t, tNext, lateralOffset, height, side) {
    const center = this.raceTrack.getPointAt(t);
    const tangent = this.raceTrack.getTangentAt(t);
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const centerNext = this.raceTrack.getPointAt(tNext);
    const tangentNext = this.raceTrack.getTangentAt(tNext);
    const normalNext = new THREE.Vector3(-tangentNext.z, 0, tangentNext.x).normalize();

    const distance = center.distanceTo(centerNext);
    const turnAngle = tangent.angleTo(tangentNext);

    if (distance > this.config.maxSegmentLength) {
      return;
    }

    // Corner case: if the turn angle exceeds threshold, fill with short fillet sub-segments.
    if (turnAngle > this.config.maxTurnAngle) {
      this.addCornerFillet(
        postGeometry, railGeometry, postMaterial, railMaterial,
        t, tNext, lateralOffset, height, side,
      );
      return;
    }

    // Straight/gentle curve: place a standard rail segment.
    this.addSegment(
      postGeometry, railGeometry, postMaterial, railMaterial,
      center, centerNext, normal, normalNext, lateralOffset, height, side,
    );
  }

  addCornerFillet(postGeometry, railGeometry, postMaterial, railMaterial, tStart, tEnd, lateralOffset, height, side) {
    const filletCount = this.config.cornerFilletSegments || 4;

    for (let i = 0; i < filletCount; i++) {
      const tA = THREE.MathUtils.lerp(tStart, tEnd, i / filletCount);
      const tB = THREE.MathUtils.lerp(tStart, tEnd, (i + 1) / filletCount);

      const centerA = this.raceTrack.getPointAt(tA);
      const tangentA = this.raceTrack.getTangentAt(tA);
      const normalA = new THREE.Vector3(-tangentA.z, 0, tangentA.x).normalize();

      const centerB = this.raceTrack.getPointAt(tB);
      const tangentB = this.raceTrack.getTangentAt(tB);
      const normalB = new THREE.Vector3(-tangentB.z, 0, tangentB.x).normalize();

      this.addSegment(
        postGeometry, railGeometry, postMaterial, railMaterial,
        centerA, centerB, normalA, normalB, lateralOffset, height, side,
      );
    }
  }

  shouldPlaceSegment(t, side) {
    const opening = this.config.pitOpening;

    if (!opening || side !== opening.side) {
      return true;
    }

    // Pit shelter barrier removal: skip rails across the pit entrance/front apron.
    return t < opening.startT || t > opening.endT;
  }

  addSegment(postGeometry, railGeometry, postMaterial, railMaterial, center, centerNext, normal, normalNext, lateralOffset, height, side) {
    const position = center.clone().addScaledVector(normal, lateralOffset * side);
    const nextPosition = centerNext.clone().addScaledVector(normalNext, lateralOffset * side);
    const trimmedSegment = this.trimSegmentBeforeExisting(position, nextPosition);

    if (!trimmedSegment) {
      return;
    }

    const segment = new THREE.Group();
    const post = new THREE.Mesh(postGeometry, postMaterial);
    const upperRail = new THREE.Mesh(railGeometry, railMaterial);
    const lowerRail = new THREE.Mesh(railGeometry, railMaterial);
    const midpoint = new THREE.Vector3().addVectors(
      trimmedSegment.start,
      trimmedSegment.end,
    ).multiplyScalar(0.5);
    const direction = new THREE.Vector3().subVectors(trimmedSegment.end, trimmedSegment.start);

    // Guard rail curve placement fix: align each rail to adjacent edge samples, not a single tangent.
    segment.position.copy(midpoint);
    segment.position.y = this.raceTrack.surfaceHeight + this.config.surfaceGap;
    segment.rotation.y = Math.atan2(direction.x, direction.z);

    post.position.y = height - segment.position.y;
    upperRail.position.y = this.config.railHeight;
    lowerRail.position.y = this.config.lowerRailHeight;
    upperRail.scale.z = direction.length() / this.config.length;
    lowerRail.scale.z = direction.length() / this.config.length;

    [post, upperRail, lowerRail].forEach((mesh) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      segment.add(mesh);
    });

    if (trimmedSegment.wasTrimmed) {
      const capPost = new THREE.Mesh(postGeometry, postMaterial);
      const capOffset = new THREE.Vector3().subVectors(trimmedSegment.end, midpoint);

      capPost.position.set(capOffset.x, height - segment.position.y, capOffset.z);
      capPost.castShadow = true;
      capPost.receiveShadow = true;
      segment.add(capPost);
    }

    this.group.add(segment);
    this.segmentFootprints.push({
      start: trimmedSegment.start.clone(),
      end: trimmedSegment.end.clone(),
    });
  }

  trimSegmentBeforeExisting(start, end) {
    const length = this.getPlanarDistance(start, end);
    const minLength = Math.max(this.config.postWidth, 0.14);

    if (length < minLength) {
      return null;
    }

    const trimGap = this.config.trimGap || Math.max(this.config.width, this.config.postWidth) * 0.85;
    const clearance = this.config.intersectionClearance || trimGap + this.config.width * 0.5;
    let stopDistance = length;

    this.segmentFootprints.forEach((existing) => {
      const hit = this.getSegmentHitDistance(start, end, existing.start, existing.end, clearance);

      if (hit === null) {
        return;
      }

      stopDistance = Math.min(stopDistance, hit - trimGap);
    });

    if (stopDistance >= length - 0.001) {
      return { start, end, wasTrimmed: false };
    }

    if (stopDistance < minLength) {
      return null;
    }

    const trimRatio = stopDistance / length;
    const trimmedEnd = new THREE.Vector3().lerpVectors(start, end, trimRatio);

    return { start, end: trimmedEnd, wasTrimmed: true };
  }

  getSegmentHitDistance(start, end, existingStart, existingEnd, clearance) {
    const length = this.getPlanarDistance(start, end);
    const minParam = Math.min(0.2, (this.config.postWidth * 1.5) / length);
    const intersection = this.getPlanarIntersectionParameter(start, end, existingStart, existingEnd);

    if (intersection !== null && intersection > minParam) {
      return intersection * length;
    }

    const endDistance = this.getPlanarPointSegmentDistance(end, existingStart, existingEnd);

    if (endDistance <= clearance) {
      return length;
    }

    return this.getPlanarOverlapDistance(start, end, existingStart, existingEnd, clearance, minParam);
  }

  getPlanarIntersectionParameter(a, b, c, d) {
    const rX = b.x - a.x;
    const rZ = b.z - a.z;
    const sX = d.x - c.x;
    const sZ = d.z - c.z;
    const denominator = this.cross2D(rX, rZ, sX, sZ);

    if (Math.abs(denominator) < 0.00001) {
      return null;
    }

    const cAX = c.x - a.x;
    const cAZ = c.z - a.z;
    const u = this.cross2D(cAX, cAZ, sX, sZ) / denominator;
    const v = this.cross2D(cAX, cAZ, rX, rZ) / denominator;

    if (u < 0 || u > 1 || v < 0 || v > 1) {
      return null;
    }

    return u;
  }

  getPlanarOverlapDistance(a, b, c, d, clearance, minParam) {
    const length = this.getPlanarDistance(a, b);

    if (length < 0.00001) {
      return null;
    }

    const dirX = (b.x - a.x) / length;
    const dirZ = (b.z - a.z) / length;
    const cProjection = ((c.x - a.x) * dirX + (c.z - a.z) * dirZ) / length;
    const dProjection = ((d.x - a.x) * dirX + (d.z - a.z) * dirZ) / length;
    const cDistance = Math.abs(this.cross2D(c.x - a.x, c.z - a.z, dirX, dirZ));
    const dDistance = Math.abs(this.cross2D(d.x - a.x, d.z - a.z, dirX, dirZ));

    if (cDistance > clearance || dDistance > clearance) {
      return null;
    }

    const overlapStart = Math.max(0, Math.min(cProjection, dProjection));
    const overlapEnd = Math.min(1, Math.max(cProjection, dProjection));

    if (overlapEnd <= minParam || overlapStart > 1) {
      return null;
    }

    return Math.max(overlapStart, minParam) * length;
  }

  getPlanarPointSegmentDistance(point, start, end) {
    const lengthSq = (end.x - start.x) ** 2 + (end.z - start.z) ** 2;

    if (lengthSq < 0.00001) {
      return this.getPlanarDistance(point, start);
    }

    const projection = THREE.MathUtils.clamp(
      ((point.x - start.x) * (end.x - start.x) + (point.z - start.z) * (end.z - start.z)) / lengthSq,
      0,
      1,
    );
    const projectedX = THREE.MathUtils.lerp(start.x, end.x, projection);
    const projectedZ = THREE.MathUtils.lerp(start.z, end.z, projection);

    return Math.hypot(point.x - projectedX, point.z - projectedZ);
  }

  getPlanarDistance(a, b) {
    return Math.hypot(a.x - b.x, a.z - b.z);
  }

  cross2D(aX, aZ, bX, bZ) {
    return aX * bZ - aZ * bX;
  }
}
