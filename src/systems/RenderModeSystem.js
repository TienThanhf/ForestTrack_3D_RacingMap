import * as THREE from 'three';

export const RenderMode = {
  SOLID: 'SOLID',
  LINES: 'LINES',
  POINTS: 'POINTS',
};

const OVERLAY_COLORS = {
  lines: 0xf7f2d5,
  points: 0xffdf72,
};

export class RenderModeSystem {
  constructor() {
    this.targets = new Map();
    this.targetOrder = [];
    this.currentTargetId = null;
    this.currentMode = RenderMode.SOLID;
    this.listeners = new Set();
  }

  registerTarget(id, label, object) {
    const target = {
      id,
      label,
      object,
      entries: this.createEntries(object),
      overlays: [],
    };

    this.targets.set(id, target);
    this.targetOrder.push(id);

    if (!this.currentTargetId) {
      this.currentTargetId = id;
    }

    return target;
  }

  registerAllTarget(id = 'all-demo', label = 'All Demo Objects') {
    const target = {
      id,
      label,
      entries: [],
      overlays: [],
      get object() {
        return null;
      },
    };

    this.targets.forEach((registeredTarget) => {
      if (registeredTarget.id !== id) {
        target.entries.push(...registeredTarget.entries);
      }
    });

    this.targets.set(id, target);
    this.targetOrder.unshift(id);
    this.currentTargetId = id;

    return target;
  }

  getTarget(id) {
    return this.targets.get(id) || null;
  }

  getTargets() {
    return this.targetOrder.map((id) => {
      const target = this.targets.get(id);

      return { id: target.id, label: target.label, object: target.object };
    });
  }

  setTarget(id) {
    if (!this.targets.has(id) || id === this.currentTargetId) {
      return;
    }

    this.restoreTarget(this.targets.get(this.currentTargetId));
    this.currentTargetId = id;
    this.applyModeToTarget(this.currentMode, id);
    this.notify();
  }

  setMode(mode) {
    if (!Object.values(RenderMode).includes(mode)) {
      return;
    }

    this.currentMode = mode;
    this.applyModeToTarget(mode, this.currentTargetId);
    this.notify();
  }

  applyModeToTarget(mode, targetId = this.currentTargetId) {
    const target = this.targets.get(targetId);

    if (!target) {
      return;
    }

    this.restoreTarget(target);

    if (mode === RenderMode.SOLID) {
      return;
    }

    target.entries.forEach((entry) => {
      entry.mesh.visible = false;
      entry.mesh.castShadow = false;
      entry.mesh.receiveShadow = false;
      const overlay = mode === RenderMode.LINES
        ? this.createLineOverlay(entry.mesh)
        : this.createPointOverlay(entry.mesh);

      entry.mesh.parent.add(overlay);
      target.overlays.push(overlay);
    });
  }

  restoreTarget(target) {
    if (!target) {
      return;
    }

    target.overlays.forEach((overlay) => {
      overlay.parent?.remove(overlay);
      overlay.geometry.dispose();
      overlay.material.dispose();
    });
    target.overlays = [];

    target.entries.forEach((entry) => {
      entry.mesh.visible = entry.originalVisible;
      entry.mesh.castShadow = entry.castShadow;
      entry.mesh.receiveShadow = entry.receiveShadow;
    });
  }

  createEntries(root) {
    const entries = [];

    root.traverse((object) => {
      if (!object.isMesh || object.userData.excludeFromRenderModes) {
        return;
      }

      entries.push({
        mesh: object,
        originalVisible: object.visible,
        castShadow: object.castShadow,
        receiveShadow: object.receiveShadow,
      });
    });

    return entries;
  }

  createLineOverlay(mesh) {
    const geometry = new THREE.WireframeGeometry(mesh.geometry);
    const material = new THREE.LineBasicMaterial({
      color: OVERLAY_COLORS.lines,
      depthTest: true,
    });
    const lines = new THREE.LineSegments(geometry, material);

    lines.name = `${mesh.name || 'Mesh'}Lines`;
    lines.position.copy(mesh.position);
    lines.rotation.copy(mesh.rotation);
    lines.scale.copy(mesh.scale);
    lines.matrixAutoUpdate = mesh.matrixAutoUpdate;
    lines.castShadow = false;
    lines.receiveShadow = false;

    return lines;
  }

  createPointOverlay(mesh) {
    const geometry = mesh.geometry.clone();
    const material = new THREE.PointsMaterial({
      color: OVERLAY_COLORS.points,
      size: 0.12,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(geometry, material);

    points.name = `${mesh.name || 'Mesh'}Points`;
    points.position.copy(mesh.position);
    points.rotation.copy(mesh.rotation);
    points.scale.copy(mesh.scale);
    points.matrixAutoUpdate = mesh.matrixAutoUpdate;
    points.castShadow = false;
    points.receiveShadow = false;

    return points;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.getState());

    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((listener) => listener(this.getState()));
  }

  getState() {
    return {
      currentMode: this.currentMode,
      currentTargetId: this.currentTargetId,
      targets: this.getTargets(),
    };
  }
}
