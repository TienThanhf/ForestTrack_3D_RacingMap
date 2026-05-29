import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  streetLampConfig,
} from '../config/environmentConfig.js';
import { AssetLoader } from './AssetLoader.js';
import {
  cameraConfig,
  developmentShadowMarkerConfig,
  groundConfig,
  orbitControlsConfig,
  sceneColors,
} from '../config/sceneConfig.js';
import { Car } from '../objects/Car.js';
import { StreetLamp } from '../objects/StreetLamp.js';
import { EnvironmentMode, EnvironmentSystem } from '../systems/EnvironmentSystem.js';
import { ApplicationMode, ModeManager } from '../systems/ModeManager.js';
import { InputController } from '../systems/InputController.js';
import { LightingSystem } from '../systems/LightingSystem.js';
import { RaceController } from '../systems/RaceController.js';
import { RenderModeSystem } from '../systems/RenderModeSystem.js';
import { TransformSystem } from '../systems/TransformSystem.js';
import { Barriers } from '../world/Barriers.js';
import { Curbs } from '../world/Curbs.js';
import { Forest } from '../world/Forest.js';
import { PitArea } from '../world/PitArea.js';
import { RaceTrack } from '../world/RaceTrack.js';
import { RoadShoulders } from '../world/RoadShoulders.js';
import { StartGate } from '../world/StartGate.js';

export class SceneManager {
  constructor({
    renderer,
    cameraManager,
    canvas,
    modeManager = new ModeManager(),
    environmentSystem = new EnvironmentSystem(),
    renderModeSystem = new RenderModeSystem(),
  }) {
    this.renderer = renderer;
    this.cameraManager = cameraManager;
    this.camera = cameraManager.camera;
    this.modeManager = modeManager;
    this.environmentSystem = environmentSystem;
    this.renderModeSystem = renderModeSystem;
    this.lastFrameTime = performance.now();
    this.assetLoader = new AssetLoader();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(sceneColors.background);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = orbitControlsConfig.dampingFactor;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = orbitControlsConfig.minDistance;
    this.controls.maxDistance = orbitControlsConfig.maxDistance;
    this.controls.minPolarAngle = orbitControlsConfig.minPolarAngle;
    this.controls.maxPolarAngle = orbitControlsConfig.maxPolarAngle;
    this.controls.maxTargetRadius = orbitControlsConfig.maxTargetRadius;
    this.controls.target.copy(cameraConfig.target);
    this.controls.update();

    this.createLights();
    this.createGround();
    this.createRaceTrack();
    this.createRoadShoulders();
    this.createCurbs();
    this.createBarriers();
    this.createPitArea();
    this.createStartGate();
    this.createStreetLamps();
    this.createForest();
    this.createPlayerCar();
    this.registerRenderModeTargets();
    this.createTransformSystem();
    this.createRaceController();
    this.createDevelopmentShadowMarker();
    this.modeManager.subscribe((mode) => this.applyMode(mode));
    this.environmentSystem.subscribe((mode) => this.applyEnvironment(mode));
  }

  start() {
    this.renderer.setAnimationLoop(() => this.render());
  }

  render() {
    const frameTime = performance.now();
    const deltaSeconds = Math.min((frameTime - this.lastFrameTime) / 1000, 0.05);
    this.lastFrameTime = frameTime;

    if (this.modeManager.isRaceMode()) {
      this.raceController.update(deltaSeconds);
    } else {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }

  createLights() {
    this.lightingSystem = new LightingSystem(this.scene);
  }

  createGround() {
    const groundGeometry = new THREE.PlaneGeometry(groundConfig.size, groundConfig.size);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: sceneColors.ground });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);

    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;

    this.scene.add(ground);
  }

  createRaceTrack() {
    this.track = new RaceTrack();
    this.scene.add(this.track.mesh);
  }

  createCurbs() {
    this.curbs = new Curbs(this.track);
    this.scene.add(this.curbs.group);
  }

  createRoadShoulders() {
    this.roadShoulders = new RoadShoulders(this.track);
    this.scene.add(this.roadShoulders.group);
  }

  createBarriers() {
    this.barriers = new Barriers(this.track);
    this.scene.add(this.barriers.group);
  }

  createPitArea() {
    this.pitArea = new PitArea(this.track);
    this.scene.add(this.pitArea.group);
  }

  createStartGate() {
    this.startGate = new StartGate(this.track);
    this.scene.add(this.startGate.group);
  }

  createStreetLamps() {
    this.streetLamps = new THREE.Group();
    this.streetLamps.name = 'StreetLamps';
    this.streetLampObjects = [];

    streetLampConfig.placements.forEach((placement) => {
      const center = this.track.getPointAt(placement.t);
      const tangent = this.track.getTangentAt(placement.t);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const lamp = new StreetLamp();

      lamp.group.position.copy(center).addScaledVector(normal, placement.lateralOffset * placement.side);
      lamp.group.rotation.y = Math.atan2(tangent.x, tangent.z);

      this.streetLamps.add(lamp.group);
      this.streetLampObjects.push(lamp);
    });

    this.scene.add(this.streetLamps);
  }

  createForest() {
    this.forest = new Forest(this.track, [this.pitArea, this.startGate]);
    this.scene.add(this.forest.group);
  }

  createPlayerCar() {
    this.playerCar = new Car({
      raceTrack: this.track,
      assetLoader: this.assetLoader,
    });
    this.scene.add(this.playerCar.group);
    this.playerCar.initialize();
  }

  createRaceController() {
    this.inputController = new InputController({
      modeManager: this.modeManager,
      environmentSystem: this.environmentSystem,
      renderModeSystem: this.renderModeSystem,
      transformSystem: this.transformSystem,
    });
    this.raceController = new RaceController({
      car: this.playerCar,
      camera: this.camera,
      inputController: this.inputController,
    });
  }

  applyMode(mode) {
    if (mode === ApplicationMode.RACE) {
      this.controls.enabled = false;
      this.transformSystem.setEnabled(false);
      this.raceController.resetInputState();
      return;
    }

    this.controls.enabled = true;
    this.transformSystem.setEnabled(true);
    this.raceController.resetInputState();
    this.cameraManager.resetToExploreView();
    this.controls.target.copy(cameraConfig.target);
    this.controls.update();
  }

  applyEnvironment(mode) {
    const nightEnabled = mode === EnvironmentMode.NIGHT;

    this.lightingSystem.applyEnvironment(mode);
    this.streetLampObjects.forEach((lamp) => lamp.setNightEnabled(nightEnabled));
    this.playerCar.setHeadlightsEnabled(nightEnabled);
  }

  registerRenderModeTargets() {
    const demoTree = this.forest.getDemoTree();

    if (demoTree) {
      this.renderModeSystem.registerTarget('tree-sample', 'Tree Sample', demoTree);
    }

    if (this.streetLampObjects[0]) {
      this.renderModeSystem.registerTarget(
        'street-lamp',
        'Street Lamp',
        this.streetLampObjects[0].getDemoGroup(),
      );
    }

    this.renderModeSystem.registerTarget('start-gate', 'Start Gate', this.startGate.group);
    this.renderModeSystem.registerTarget('pit-shelter', 'Pit Shelter', this.pitArea.group);
    this.renderModeSystem.registerTarget(
      'primitive-car',
      'Primitive Car',
      this.playerCar.getPrimitiveDemoGroup(),
    );
    this.renderModeSystem.registerAllTarget();
  }

  createTransformSystem() {
    this.transformSystem = new TransformSystem({
      camera: this.camera,
      domElement: this.renderer.domElement,
      orbitControls: this.controls,
    });
    const demoTree = this.forest.getDemoTree();

    if (demoTree) {
      this.transformSystem.registerTarget('tree-sample', 'Tree Sample', demoTree);
    }

    if (this.streetLampObjects[0]) {
      this.transformSystem.registerTarget(
        'street-lamp',
        'Street Lamp',
        this.streetLampObjects[0].group,
      );
    }

    this.transformSystem.registerTarget('start-gate', 'Start Gate', this.startGate.group);
    this.transformSystem.registerTarget('pit-shelter', 'Pit Shelter', this.pitArea.group);
    this.scene.add(this.transformSystem.object);
  }

  createDevelopmentShadowMarker() {
    const cubeGeometry = new THREE.BoxGeometry(
      developmentShadowMarkerConfig.size,
      developmentShadowMarkerConfig.size,
      developmentShadowMarkerConfig.size,
    );
    const cubeMaterial = new THREE.MeshLambertMaterial({ color: sceneColors.shadowMarker });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

    cube.name = 'DevelopmentShadowMarker';
    cube.position.copy(developmentShadowMarkerConfig.position);
    cube.castShadow = true;
    cube.receiveShadow = true;

    this.scene.add(cube);
  }
}
