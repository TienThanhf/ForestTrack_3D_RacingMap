import { TransformControls } from 'three/addons/controls/TransformControls.js';

export const TransformMode = {
  TRANSLATE: 'translate',
  ROTATE: 'rotate',
  SCALE: 'scale',
};

export const NO_TRANSFORM_TARGET = 'none';

export class TransformSystem {
  constructor({ camera, domElement, orbitControls }) {
    this.camera = camera;
    this.orbitControls = orbitControls;
    this.targets = new Map();
    this.targetOrder = [];
    this.currentTargetId = null;
    this.currentMode = TransformMode.TRANSLATE;
    this.enabled = true;
    this.listeners = new Set();
    this.dragging = false;

    this.controls = new TransformControls(camera, domElement);
    this.helper = this.controls.getHelper();
    this.controls.setMode(this.currentMode);
    this.controls.setSize(0.82);
    this.controls.addEventListener('dragging-changed', (event) => {
      this.dragging = event.value;
      this.updateOrbitControlsState();
    });
  }

  get object() {
    return this.helper;
  }

  registerTarget(id, label, root) {
    if (!root) {
      return null;
    }

    const target = {
      id,
      label,
      root,
      initialPosition: root.position.clone(),
      initialQuaternion: root.quaternion.clone(),
      initialScale: root.scale.clone(),
    };

    this.targets.set(id, target);
    this.targetOrder.push(id);

    return target;
  }

  setTargetsFromRenderMode(renderModeSystem) {
    renderModeSystem.getTargets()
      .filter((target) => target.id !== 'all-demo' && target.object)
      .forEach((target) => {
        this.registerTarget(target.id, target.label, target.object);
      });
  }

  selectTarget(id) {
    if (id === NO_TRANSFORM_TARGET || id === null) {
      this.currentTargetId = null;
      this.controls.detach();
      this.helper.visible = false;
      this.controls.enabled = false;
      this.dragging = false;
      this.updateOrbitControlsState();
      this.notify();
      return;
    }

    if (!this.targets.has(id)) {
      return;
    }

    this.currentTargetId = id;
    this.controls.attach(this.targets.get(id).root);
    this.helper.visible = this.enabled;
    this.controls.enabled = this.enabled;
    this.notify();
  }

  setMode(mode) {
    if (!Object.values(TransformMode).includes(mode)) {
      return;
    }

    this.currentMode = mode;
    this.controls.setMode(mode);
    this.notify();
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    this.controls.enabled = enabled && Boolean(this.currentTargetId);
    this.helper.visible = enabled && Boolean(this.currentTargetId);

    if (!enabled) {
      this.dragging = false;
    } else if (this.currentTargetId) {
      this.controls.attach(this.targets.get(this.currentTargetId).root);
    }

    this.updateOrbitControlsState();
    this.notify();
  }

  resetSelectedTransform() {
    const target = this.targets.get(this.currentTargetId);

    if (!target) {
      return;
    }

    target.root.position.copy(target.initialPosition);
    target.root.quaternion.copy(target.initialQuaternion);
    target.root.scale.copy(target.initialScale);
    target.root.updateMatrixWorld(true);
    this.notify();
  }

  getTargets() {
    return this.targetOrder.map((id) => {
      const target = this.targets.get(id);

      return { id: target.id, label: target.label };
    });
  }

  getSelectedRoot() {
    return this.targets.get(this.currentTargetId)?.root || null;
  }

  getState() {
    return {
      currentMode: this.currentMode,
      currentTargetId: this.currentTargetId,
      enabled: this.enabled,
      targets: this.getTargets(),
    };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.getState());

    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((listener) => listener(this.getState()));
  }

  updateOrbitControlsState() {
    this.orbitControls.enabled = this.enabled && !this.dragging;
  }
}
