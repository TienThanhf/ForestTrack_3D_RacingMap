import './style.css';
import { CameraManager } from './core/CameraManager.js';
import { RendererManager } from './core/RendererManager.js';
import { SceneManager } from './core/SceneManager.js';
import { EnvironmentSystem } from './systems/EnvironmentSystem.js';
import { ModeManager } from './systems/ModeManager.js';
import { RenderModeSystem } from './systems/RenderModeSystem.js';
import { ModeControls } from './ui/ModeControls.js';
import { StartScreen } from './ui/StartScreen.js';

const appElement = document.querySelector('#app');

const rendererManager = new RendererManager(appElement);
const cameraManager = new CameraManager(window.innerWidth, window.innerHeight);
const modeManager = new ModeManager();
const environmentSystem = new EnvironmentSystem();
const renderModeSystem = new RenderModeSystem();
const sceneManager = new SceneManager({
  renderer: rendererManager.renderer,
  cameraManager,
  canvas: rendererManager.canvas,
  modeManager,
  environmentSystem,
  renderModeSystem,
});
new ModeControls({
  container: document.body,
  modeManager,
  environmentSystem,
  renderModeSystem,
  transformSystem: sceneManager.transformSystem,
  cameraManager,
  orbitControls: sceneManager.controls,
  raceController: sceneManager.raceController,
  carOptions: sceneManager.getCarOptions(),
  getActiveCarId: () => sceneManager.getActiveCarId(),
  selectActiveCar: (carId) => sceneManager.selectActiveCar(carId),
});
new StartScreen({
  container: document.body,
  modeManager,
});

function resizeApplication() {
  rendererManager.resize(window.innerWidth, window.innerHeight);
  cameraManager.resize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', resizeApplication);

sceneManager.start();
