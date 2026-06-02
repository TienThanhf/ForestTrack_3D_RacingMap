import { ApplicationMode } from '../systems/ModeManager.js';
import { EnvironmentMode } from '../systems/EnvironmentSystem.js';
import { RenderMode } from '../systems/RenderModeSystem.js';
import { RaceCameraMode } from '../systems/RaceController.js';
import { NO_TRANSFORM_TARGET, TransformMode } from '../systems/TransformSystem.js';

export class ModeControls {
  constructor({
    container,
    modeManager,
    environmentSystem,
    renderModeSystem,
    transformSystem,
    cameraManager,
    orbitControls,
    raceController,
    carOptions = [],
    getActiveCarId,
    selectActiveCar,
  }) {
    this.modeManager = modeManager;
    this.environmentSystem = environmentSystem;
    this.renderModeSystem = renderModeSystem;
    this.transformSystem = transformSystem;
    this.cameraManager = cameraManager;
    this.orbitControls = orbitControls;
    this.raceController = raceController;
    this.carOptions = carOptions;
    this.getActiveCarId = getActiveCarId;
    this.selectActiveCar = selectActiveCar;
    this.cameraInputs = {};
    this.transformModeButtons = new Map();
    this.inspectorControls = [];
    this.latestRaceState = this.raceController.getRaceState();
    this.element = document.createElement('section');
    this.element.className = 'mode-panel';
    this.element.setAttribute('aria-label', 'Mode controls');

    this.exploreButton = this.createButton('Explore');
    this.raceButton = this.createButton('Race');
    this.environmentButton = this.createButton('Night');
    this.environmentLabel = document.createElement('p');
    this.environmentLabel.className = 'mode-panel__label mode-panel__label--environment';
    this.renderTargetSelect = document.createElement('select');
    this.renderTargetSelect.className = 'mode-panel__select';
    this.renderModeButtons = new Map();
    this.label = document.createElement('p');
    this.label.className = 'mode-panel__label';

    const buttonRow = document.createElement('div');
    buttonRow.className = 'mode-panel__buttons';
    buttonRow.append(this.exploreButton, this.raceButton);

    this.raceStatusSection = this.createRaceStatusSection();
    this.renderSection = this.createRenderSection();
    this.raceCameraSection = this.createRaceCameraSection();
    this.cameraSection = this.createCameraSection();
    this.transformSection = this.createTransformSection();
    this.element.append(
      buttonRow,
      this.environmentButton,
      this.environmentLabel,
      this.label,
      this.raceStatusSection,
      this.raceCameraSection,
      this.renderSection,
      this.cameraSection,
      this.transformSection,
    );
    container.append(this.element);

    this.exploreButton.addEventListener('click', () => {
      this.modeManager.setMode(ApplicationMode.EXPLORE);
    });
    this.raceButton.addEventListener('click', () => {
      this.modeManager.setMode(ApplicationMode.RACE);
    });
    this.environmentButton.addEventListener('click', () => {
      this.environmentSystem.toggleEnvironment();
    });
    this.renderTargetSelect.addEventListener('change', () => {
      this.renderModeSystem.setTarget(this.renderTargetSelect.value);
    });

    this.modeManager.subscribe((mode) => this.update(mode));
    this.environmentSystem.subscribe((mode) => this.updateEnvironment(mode));
    this.renderModeSystem.subscribe((state) => this.updateRenderControls(state));
    this.transformSystem.subscribe((state) => this.updateTransformControls(state));
    this.raceController.subscribeRaceState((state) => this.updateRaceState(state));
    this.refreshCameraInputs();
    this.startSpeedReadoutLoop();
  }

  createButton(label) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.className = 'mode-panel__button';

    return button;
  }

  update(mode) {
    const isRaceMode = mode === ApplicationMode.RACE;

    this.exploreButton.classList.toggle('is-active', !isRaceMode);
    this.raceButton.classList.toggle('is-active', isRaceMode);
    this.exploreButton.setAttribute('aria-pressed', String(!isRaceMode));
    this.raceButton.setAttribute('aria-pressed', String(isRaceMode));
    this.label.textContent = isRaceMode
      ? 'Race Mode: W/A/S/D or arrows drive. Q side view, E rear view. Esc returns.'
      : 'Explore Mode: orbit/pan/zoom with mouse. F focuses. C starts race.';
    this.setInspectorEnabled(!isRaceMode);
    // Race mode UI filtering hides editing/demo controls without deleting them.
    this.raceStatusSection.hidden = !isRaceMode;
    this.raceCameraSection.hidden = !isRaceMode;
    this.renderSection.hidden = isRaceMode;
    this.cameraSection.hidden = isRaceMode;
    this.transformSection.hidden = isRaceMode;
    this.refreshSelectedCar();
    this.refreshCameraInputs();
  }

  updateEnvironment(mode) {
    const isNightMode = mode === EnvironmentMode.NIGHT;

    this.environmentButton.textContent = isNightMode ? 'Day' : 'Night';
    this.environmentButton.classList.toggle('is-active', isNightMode);
    this.environmentButton.setAttribute('aria-pressed', String(isNightMode));
    this.environmentLabel.textContent = isNightMode
      ? 'Environment: Night. N returns to day.'
      : 'Environment: Day. N switches to night.';
  }

  createRenderSection() {
    const section = document.createElement('div');
    section.className = 'mode-panel__graphics';
    const title = document.createElement('p');
    title.className = 'mode-panel__label mode-panel__label--environment';
    title.textContent = 'Graphics Demo';
    const modeRow = document.createElement('div');
    modeRow.className = 'mode-panel__mode-buttons';

    [
      ['Solid', RenderMode.SOLID],
      ['Lines', RenderMode.LINES],
      ['Points', RenderMode.POINTS],
    ].forEach(([label, mode]) => {
      const button = this.createButton(label);
      button.addEventListener('click', () => {
        this.renderModeSystem.setMode(mode);
      });
      this.renderModeButtons.set(mode, button);
      modeRow.append(button);
    });

    section.append(title, this.renderTargetSelect, modeRow);

    return section;
  }

  updateRenderControls(state) {
    this.renderTargetSelect.replaceChildren();
    state.targets.forEach((target) => {
      const option = document.createElement('option');
      option.value = target.id;
      option.textContent = target.label;
      option.selected = target.id === state.currentTargetId;
      this.renderTargetSelect.append(option);
    });

    this.renderModeButtons.forEach((button, mode) => {
      const isActive = mode === state.currentMode;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  createRaceStatusSection() {
    const section = document.createElement('div');
    section.className = 'mode-panel__graphics';
    section.hidden = true;
    const title = document.createElement('p');
    title.className = 'mode-panel__label mode-panel__label--environment';
    title.textContent = 'Race Status';
    this.speedLabel = document.createElement('p');
    this.speedLabel.className = 'mode-panel__label';
    this.speedLabel.textContent = 'Speed: 0.0';
    const carField = document.createElement('label');
    carField.className = 'mode-panel__field mode-panel__field--wide';
    const carLabel = document.createElement('span');
    carLabel.textContent = 'Car';
    this.carSelect = document.createElement('select');
    this.carSelect.className = 'mode-panel__select';

    this.carOptions.forEach((option) => {
      const element = document.createElement('option');
      element.value = option.id;
      element.textContent = option.label;
      this.carSelect.append(element);
    });
    this.carSelect.addEventListener('change', async () => {
      if (!this.selectActiveCar) {
        return;
      }

      this.carSelect.disabled = true;
      await this.selectActiveCar(this.carSelect.value);
      this.refreshSelectedCar();
      this.carSelect.disabled = false;
    });

    const lapField = document.createElement('label');
    lapField.className = 'mode-panel__field mode-panel__field--wide';
    const lapLabel = document.createElement('span');
    lapLabel.textContent = 'Laps';
    this.lapSelect = document.createElement('select');
    this.lapSelect.className = 'mode-panel__select';
    this.latestRaceState.lapOptions.forEach((lapCount) => {
      const element = document.createElement('option');
      element.value = String(lapCount);
      element.textContent = `${lapCount}`;
      this.lapSelect.append(element);
    });
    // Lap count selection UI lets Race Mode choose the race length before the timer starts.
    this.lapSelect.addEventListener('change', () => {
      this.raceController.setLapCount(Number(this.lapSelect.value));
    });
    lapField.append(lapLabel, this.lapSelect);

    this.selectedLapLabel = document.createElement('p');
    this.selectedLapLabel.className = 'mode-panel__label';
    this.currentLapLabel = document.createElement('p');
    this.currentLapLabel.className = 'mode-panel__label';
    this.timerLabel = document.createElement('p');
    this.timerLabel.className = 'mode-panel__label';
    this.timeTrialStatusLabel = document.createElement('p');
    this.timeTrialStatusLabel.className = 'mode-panel__label';
    this.shortcutLabel = document.createElement('p');
    this.shortcutLabel.className = 'mode-panel__label';
    this.shortcutLabel.textContent = 'Camera: Q side view, E rear view, Esc explore.';
    this.timeTrialButton = this.createButton('Start Time Trial');
    this.timeTrialButton.classList.add('mode-panel__wide-button');
    this.timeTrialButton.addEventListener('click', () => {
      if (this.latestRaceState.timeTrialEnabled || this.latestRaceState.timerRunning) {
        this.raceController.resetRaceSession();
        return;
      }

      this.raceController.startTimeTrial();
    });

    carField.append(carLabel, this.carSelect);
    section.append(
      title,
      this.speedLabel,
      carField,
      lapField,
      this.selectedLapLabel,
      this.currentLapLabel,
      this.timerLabel,
      this.timeTrialStatusLabel,
      this.shortcutLabel,
      this.timeTrialButton,
    );

    return section;
  }

  updateRaceState(state) {
    this.latestRaceState = state;

    if (this.lapSelect) {
      this.lapSelect.value = String(state.selectedLapCount);
    }

    if (this.selectedLapLabel) {
      this.selectedLapLabel.textContent = `Selected laps: ${state.selectedLapCount}`;
    }

    if (this.currentLapLabel) {
      this.currentLapLabel.textContent = `Lap: ${state.currentLap} / ${state.selectedLapCount}`;
    }

    if (this.timerLabel) {
      const timerPrefix = state.timerRunning ? 'Timer' : 'Timer';
      this.timerLabel.textContent = `${timerPrefix}: ${state.elapsedSeconds.toFixed(1)}s`;
    }

    if (this.timeTrialStatusLabel) {
      this.timeTrialStatusLabel.textContent = this.getTimeTrialStatusText(state);
    }

    if (this.timeTrialButton) {
      this.timeTrialButton.textContent = state.timeTrialEnabled || state.timerRunning
        ? 'Cancel Time Trial'
        : 'Start Time Trial';
      this.timeTrialButton.classList.toggle('is-active', state.timeTrialEnabled || state.timerRunning);
    }

    this.updateResultPanel(state);
  }

  getTimeTrialStatusText(state) {
    if (state.status === 'finished') {
      return 'Time trial complete.';
    }

    if (state.status === 'running') {
      return 'Time trial running.';
    }

    if (state.status === 'waiting') {
      // Waiting-for-start-line state: timing is armed but the clock has not started yet.
      return 'Waiting for start line crossing...';
    }

    // Practice mode behavior: driving is free, with no timer or lap counting.
    return 'Practice mode: timed laps are off.';
  }

  refreshSelectedCar() {
    if (!this.carSelect || !this.getActiveCarId) {
      return;
    }

    this.carSelect.value = this.getActiveCarId();
  }

  startSpeedReadoutLoop() {
    const update = () => {
      if (this.speedLabel && this.raceController) {
        this.speedLabel.textContent = `Speed: ${this.raceController.getSpeed().toFixed(1)}`;
      }

      requestAnimationFrame(update);
    };

    update();
  }

  createCameraSection() {
    const section = document.createElement('div');
    section.className = 'mode-panel__graphics';
    const title = document.createElement('p');
    title.className = 'mode-panel__label mode-panel__label--environment';
    title.textContent = 'Camera / Perspective';
    const grid = document.createElement('div');
    grid.className = 'mode-panel__input-grid';

    [
      ['x', 'X', -80, 80, 1],
      ['y', 'Y', 5, 70, 1],
      ['z', 'Z', -80, 80, 1],
      ['fieldOfView', 'FOV', 25, 85, 1],
      ['nearPlane', 'Near', 0.01, 10, 0.01],
      ['farPlane', 'Far', 40, 700, 1],
    ].forEach(([key, label, min, max, step]) => {
      const wrapper = document.createElement('label');
      wrapper.className = 'mode-panel__field';
      const span = document.createElement('span');
      span.textContent = label;
      const input = document.createElement('input');
      input.type = 'number';
      input.min = String(min);
      input.max = String(max);
      input.step = String(step);
      input.addEventListener('change', () => this.applyCameraInputs());
      this.inspectorControls.push(input);
      wrapper.append(span, input);
      grid.append(wrapper);
      this.cameraInputs[key] = input;
    });

    const resetButton = this.createButton('Reset Explore Camera');
    resetButton.classList.add('mode-panel__wide-button');
    resetButton.addEventListener('click', () => {
      this.cameraManager.resetToExploreView();
      this.orbitControls.target.copy(this.cameraManager.defaults.target);
      this.orbitControls.update();
      this.refreshCameraInputs();
    });
    this.inspectorControls.push(resetButton);

    section.append(title, grid, resetButton);

    return section;
  }

  createRaceCameraSection() {
    const section = document.createElement('div');
    section.className = 'mode-panel__graphics';
    section.hidden = true;
    const title = document.createElement('p');
    title.className = 'mode-panel__label mode-panel__label--environment';
    title.textContent = 'Race Cameras';
    const modeRow = document.createElement('div');
    modeRow.className = 'mode-panel__mode-buttons mode-panel__mode-buttons--two';
    const sideButton = this.createButton('Side View');
    const rearButton = this.createButton('Rear View');

    // Side/rear hold-to-view camera shortcuts are mirrored by press-and-hold UI buttons.
    this.bindHoldCameraButton(sideButton, RaceCameraMode.SIDE_CHECK);
    this.bindHoldCameraButton(rearButton, RaceCameraMode.REAR_CHECK);

    modeRow.append(sideButton, rearButton);
    section.append(title, modeRow);

    return section;
  }

  bindHoldCameraButton(button, mode) {
    const release = () => {
      this.raceController.setHeldCameraCheck(mode, false);
    };

    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      button.setPointerCapture?.(event.pointerId);
      this.raceController.setHeldCameraCheck(mode, true);
    });
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('pointerleave', release);
  }

  updateResultPanel(state) {
    if (!this.resultPanel) {
      this.resultPanel = this.createResultPanel();
      document.body.append(this.resultPanel);
    }

    this.resultPanel.hidden = !state.raceFinished || state.resultDismissed;

    if (!state.raceFinished || state.resultDismissed) {
      return;
    }

    // Final result panel appears above the game UI when the selected laps are complete.
    this.resultMessage.textContent = `Congratulations! You completed ${state.selectedLapCount} laps in ${state.elapsedSeconds.toFixed(1)} seconds.`;
  }

  createResultPanel() {
    const panel = document.createElement('section');
    panel.className = 'race-result';
    panel.hidden = true;
    this.resultMessage = document.createElement('p');
    this.resultMessage.className = 'race-result__message';
    const actions = document.createElement('div');
    actions.className = 'race-result__actions';
    const restartButton = this.createButton('Restart');
    const closeButton = this.createButton('Close');

    restartButton.addEventListener('click', () => {
      this.raceController.startTimeTrial();
    });
    closeButton.addEventListener('click', () => {
      this.raceController.closeResultPanel();
    });

    actions.append(restartButton, closeButton);
    panel.append(this.resultMessage, actions);

    return panel;
  }

  createTransformSection() {
    const section = document.createElement('div');
    section.className = 'mode-panel__graphics';
    const title = document.createElement('p');
    title.className = 'mode-panel__label mode-panel__label--environment';
    title.textContent = 'Transform Inspector';
    this.transformTargetSelect = document.createElement('select');
    this.transformTargetSelect.className = 'mode-panel__select';
    this.transformTargetSelect.addEventListener('change', () => {
      this.transformSystem.selectTarget(this.transformTargetSelect.value);

      if (this.transformTargetSelect.value !== NO_TRANSFORM_TARGET) {
        this.renderModeSystem.setTarget(this.transformTargetSelect.value);
      }
    });
    this.inspectorControls.push(this.transformTargetSelect);

    const modeRow = document.createElement('div');
    modeRow.className = 'mode-panel__mode-buttons';
    [
      ['Translate', TransformMode.TRANSLATE],
      ['Rotate', TransformMode.ROTATE],
      ['Scale', TransformMode.SCALE],
    ].forEach(([label, mode]) => {
      const button = this.createButton(label);
      button.addEventListener('click', () => this.transformSystem.setMode(mode));
      this.transformModeButtons.set(mode, button);
      this.inspectorControls.push(button);
      modeRow.append(button);
    });

    const resetButton = this.createButton('Reset Selected Transform');
    resetButton.classList.add('mode-panel__wide-button');
    resetButton.addEventListener('click', () => {
      this.transformSystem.resetSelectedTransform();
    });
    this.inspectorControls.push(resetButton);

    section.append(title, this.transformTargetSelect, modeRow, resetButton);

    return section;
  }

  applyCameraInputs() {
    const state = this.readCameraInputs();

    if (state.farPlane <= state.nearPlane) {
      state.farPlane = state.nearPlane + 1;
    }

    this.cameraManager.setExplorePosition({
      x: state.x,
      y: state.y,
      z: state.z,
    });
    this.cameraManager.setPerspective(state);
    this.refreshCameraInputs();
    this.orbitControls.update();
  }

  readCameraInputs() {
    const current = this.cameraManager.getCameraState();

    return Object.fromEntries(Object.entries(this.cameraInputs).map(([key, input]) => {
      const value = Number(input.value);

      return [key, Number.isFinite(value) ? value : current[key]];
    }));
  }

  refreshCameraInputs() {
    const state = this.cameraManager.getCameraState();

    Object.entries(this.cameraInputs).forEach(([key, input]) => {
      input.value = String(Number(state[key].toFixed(key === 'nearPlane' ? 2 : 1)));
    });
  }

  updateTransformControls(state) {
    this.transformTargetSelect.replaceChildren();
    const noneOption = document.createElement('option');
    noneOption.value = NO_TRANSFORM_TARGET;
    noneOption.textContent = 'None';
    noneOption.selected = state.currentTargetId === null;
    this.transformTargetSelect.append(noneOption);

    state.targets.forEach((target) => {
      const option = document.createElement('option');
      option.value = target.id;
      option.textContent = target.label;
      option.selected = target.id === state.currentTargetId;
      this.transformTargetSelect.append(option);
    });

    this.transformModeButtons.forEach((button, mode) => {
      const isActive = mode === state.currentMode;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
    this.setInspectorEnabled(state.enabled && this.modeManager.isExploreMode());
  }

  setInspectorEnabled(enabled) {
    this.inspectorControls.filter(Boolean).forEach((control) => {
      control.disabled = !enabled;
    });
  }
}
