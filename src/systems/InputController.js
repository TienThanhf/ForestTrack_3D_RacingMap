import { ApplicationMode } from './ModeManager.js';
import { RenderMode } from './RenderModeSystem.js';
import { TransformMode } from './TransformSystem.js';

export class InputController {
  constructor({
    modeManager,
    environmentSystem,
    renderModeSystem,
    transformSystem,
  }) {
    this.modeManager = modeManager;
    this.environmentSystem = environmentSystem;
    this.renderModeSystem = renderModeSystem;
    this.transformSystem = transformSystem;
    this.actions = {
      accelerate: false,
      brake: false,
      steerLeft: false,
      steerRight: false,
    };

    this.keyMap = new Map([
      ['KeyW', 'accelerate'],
      ['ArrowUp', 'accelerate'],
      ['KeyS', 'brake'],
      ['ArrowDown', 'brake'],
      ['KeyA', 'steerLeft'],
      ['ArrowLeft', 'steerLeft'],
      ['KeyD', 'steerRight'],
      ['ArrowRight', 'steerRight'],
    ]);

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.clearDrivingActions = this.clearDrivingActions.bind(this);

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.clearDrivingActions);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.clearDrivingActions();
      }
    });

    this.modeManager.subscribe((mode) => {
      if (mode !== ApplicationMode.RACE) {
        this.clearDrivingActions();
      }
    });
  }

  getDrivingActions() {
    if (!this.modeManager.isRaceMode()) {
      return {
        accelerate: false,
        brake: false,
        steerLeft: false,
        steerRight: false,
      };
    }

    return { ...this.actions };
  }

  handleKeyDown(event) {
    if (this.shouldIgnoreKeyboardEvent(event)) {
      return;
    }

    if (event.code === 'KeyC') {
      event.preventDefault();
      this.modeManager.toggleMode();
      return;
    }

    if (event.code === 'KeyN' && this.environmentSystem) {
      event.preventDefault();
      this.environmentSystem.toggleEnvironment();
      return;
    }

    if (this.renderModeSystem && this.handleRenderModeShortcut(event)) {
      return;
    }

    if (this.transformSystem && this.handleTransformShortcut(event)) {
      return;
    }

    if (event.code === 'Escape' && this.modeManager.isRaceMode()) {
      event.preventDefault();
      this.modeManager.setMode(ApplicationMode.EXPLORE);
      return;
    }

    const action = this.keyMap.get(event.code);

    if (!action || !this.modeManager.isRaceMode()) {
      return;
    }

    event.preventDefault();
    this.actions[action] = true;
  }

  handleKeyUp(event) {
    const action = this.keyMap.get(event.code);

    if (!action) {
      return;
    }

    this.actions[action] = false;
  }

  handleRenderModeShortcut(event) {
    const modeByKey = {
      Digit1: RenderMode.SOLID,
      Digit2: RenderMode.LINES,
      Digit3: RenderMode.POINTS,
    };
    const nextMode = modeByKey[event.code];

    if (!nextMode) {
      return false;
    }

    event.preventDefault();
    this.renderModeSystem.setMode(nextMode);

    return true;
  }

  handleTransformShortcut(event) {
    if (!this.modeManager.isExploreMode()) {
      return false;
    }

    const modeByKey = {
      KeyT: TransformMode.TRANSLATE,
      KeyR: TransformMode.ROTATE,
      KeyS: TransformMode.SCALE,
    };
    const nextMode = modeByKey[event.code];

    if (!nextMode) {
      return false;
    }

    event.preventDefault();
    this.transformSystem.setMode(nextMode);

    return true;
  }

  clearDrivingActions() {
    Object.keys(this.actions).forEach((action) => {
      this.actions[action] = false;
    });
  }

  shouldIgnoreKeyboardEvent(event) {
    const tagName = event.target?.tagName;

    return tagName === 'INPUT'
      || tagName === 'TEXTAREA'
      || tagName === 'SELECT'
      || event.target?.isContentEditable;
  }
}
