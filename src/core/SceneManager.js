import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  rockConfig,
  streetLampConfig,
} from '../config/environmentConfig.js';
import { AssetLoader } from './AssetLoader.js';
import {
  cameraConfig,
  groundConfig,
  orbitControlsConfig,
  sceneColors,
} from '../config/sceneConfig.js';
import { Car } from '../objects/Car.js';
import { ImportedStreetLight } from '../objects/ImportedStreetLight.js';
import { TeapotTrophy } from '../objects/TeapotTrophy.js';
import { EnvironmentMode, EnvironmentSystem } from '../systems/EnvironmentSystem.js';
import { ApplicationMode, ModeManager } from '../systems/ModeManager.js';
import { InputController } from '../systems/InputController.js';
import { LightingSystem } from '../systems/LightingSystem.js';
import { RaceCameraMode, RaceController } from '../systems/RaceController.js';
import { RenderModeSystem } from '../systems/RenderModeSystem.js';
import { TransformSystem } from '../systems/TransformSystem.js';
import { Barriers } from '../world/Barriers.js';
import { Curbs } from '../world/Curbs.js';
import { Forest } from '../world/Forest.js';
import { PitArea } from '../world/PitArea.js';
import { RaceTrack } from '../world/RaceTrack.js';
import { RoadDecorations } from '../world/RoadDecorations.js';
import { RoadShoulders } from '../world/RoadShoulders.js';
import { Rocks } from '../world/Rocks.js';
import { StartFinishLine } from '../world/StartFinishLine.js';
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
    this.createMapGroups();

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = orbitControlsConfig.exploreDamping;
    this.controls.zoomSpeed = orbitControlsConfig.zoomSpeed;
    this.controls.panSpeed = orbitControlsConfig.panSpeed;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = orbitControlsConfig.minDistance;
    this.controls.maxDistance = orbitControlsConfig.maxDistance;
    this.controls.minPolarAngle = orbitControlsConfig.minPolarAngle;
    this.controls.maxPolarAngle = orbitControlsConfig.maxPolarAngle;
    this.controls.maxTargetRadius = orbitControlsConfig.maxTargetRadius;
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.PAN,
    };
    this.controls.target.copy(cameraConfig.target);
    this.controls.update();

    this.createLights();
    this.createGround();
    this.createRaceTrack();
    this.createRoadDecorations();
    this.createRoadShoulders();
    this.createStartFinishLine();
    this.createCurbs();
    this.createBarriers();
    this.createPitArea();
    this.createTeapotTrophy();
    this.createStartGate();
    this.createStreetLamps();
    this.createRocks();
    this.createForest();
    this.createPlayerCar();
    this.registerRenderModeTargets();
    this.createTransformSystem();
    this.createRaceController();
    this.exploreTransitionActive = false;
    this.exploreTransitionElapsed = 0;
    this.exploreTransitionStartPosition = new THREE.Vector3();
    this.exploreTransitionStartTarget = new THREE.Vector3();
    this.exploreTransitionEndPosition = new THREE.Vector3();
    this.exploreTransitionEndTarget = new THREE.Vector3();

    this.modeManager.subscribe((mode, previousMode) => this.applyMode(mode, previousMode));
    this.environmentSystem.subscribe((mode) => this.applyEnvironment(mode));
  }

  start() {
    this.renderer.setAnimationLoop(() => this.render());
  }

  render() {
    const frameTime = performance.now();
    const deltaSeconds = Math.min((frameTime - this.lastFrameTime) / 1000, 0.05);
    this.lastFrameTime = frameTime;

    this.forest.update(frameTime / 1000);

    if (this.modeManager.isRaceMode()) {
      this.raceController.update(deltaSeconds);
    } else {
      if (this.exploreTransitionActive) {
        this.updateExploreTransition(deltaSeconds);
      } else {
        this.controls.update();
        this.clampExploreCameraToGround();
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  createLights() {
    this.lightingSystem = new LightingSystem(this.scene);
  }

  createMapGroups() {
    this.trackGroup = new THREE.Group();
    this.trackGroup.name = 'trackGroup';
    this.curbGroup = new THREE.Group();
    this.curbGroup.name = 'curbGroup';
    this.fenceGroup = new THREE.Group();
    this.fenceGroup.name = 'fenceGroup';
    this.treeGroup = new THREE.Group();
    this.treeGroup.name = 'treeGroup';
    this.buildingGroup = new THREE.Group();
    this.buildingGroup.name = 'buildingGroup';
    this.streetLightGroup = new THREE.Group();
    this.streetLightGroup.name = 'streetLightGroup';
    this.rockGroup = new THREE.Group();
    this.rockGroup.name = 'rockGroup';
    this.collisionGroup = new THREE.Group();
    this.collisionGroup.name = 'collisionGroup';
    this.collisionGroup.visible = false;

    this.scene.add(
      this.trackGroup,
      this.curbGroup,
      this.fenceGroup,
      this.treeGroup,
      this.buildingGroup,
      this.streetLightGroup,
      this.rockGroup,
      this.collisionGroup,
    );
  }

  createGround() {
    const groundGeometry = new THREE.PlaneGeometry(groundConfig.size, groundConfig.size);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: sceneColors.ground });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);

    ground.name = 'GroundShadowReceiver';
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;

    this.scene.add(ground);
  }

  createRaceTrack() {
    this.track = new RaceTrack();
    this.trackGroup.add(this.track.mesh);
  }

  createRoadDecorations() {
    this.roadDecorations = new RoadDecorations(this.track);
    this.trackGroup.add(this.roadDecorations.group);
  }

  createCurbs() {
    this.curbs = new Curbs(this.track);
    this.curbGroup.add(this.curbs.group);
  }

  createRoadShoulders() {
    this.roadShoulders = new RoadShoulders(this.track);
    this.trackGroup.add(this.roadShoulders.group);
  }

  createStartFinishLine() {
    this.startFinishLine = new StartFinishLine(this.track);
    this.trackGroup.add(this.startFinishLine.group);
  }

  createBarriers() {
    this.barriers = new Barriers(this.track);
    this.fenceGroup.add(this.barriers.group);
  }

  createPitArea() {
    this.pitArea = new PitArea(this.track);
    this.buildingGroup.add(this.pitArea.group);
  }

  createTeapotTrophy() {
    this.teapotTrophy = new TeapotTrophy({ pitArea: this.pitArea });
    this.buildingGroup.add(this.teapotTrophy.group);
  }

  createStartGate() {
    this.startGate = new StartGate(this.track);
    this.buildingGroup.add(this.startGate.group);
  }

  createStreetLamps() {
    this.streetLamps = new THREE.Group();
    this.streetLamps.name = 'StreetLamps';
    this.streetLampObjects = [];
    this.streetLightGroup.add(this.streetLamps);

    // Old procedural street light geometry is disabled; imported GLB lamps are cloned instead.
    this.assetLoader.loadGltfIfAvailable(streetLampConfig.modelPath)
      .then((gltf) => {
        if (!gltf) {
          console.warn(`Unable to load street light model ${streetLampConfig.modelPath}.`);
          return;
        }

        streetLampConfig.placements.forEach((placement) => {
          const lamp = new ImportedStreetLight(gltf.scene, {
            raceTrack: this.track,
            placement,
            config: streetLampConfig,
          });

          this.streetLamps.add(lamp.group);
          this.streetLampObjects.push(lamp);
        });
        this.applyEnvironment(this.environmentSystem.currentMode);
      })
      .catch((error) => {
        console.warn('Unable to create imported street lights.', error);
      });
  }

  createRocks() {
    this.rocks = new THREE.Group();
    this.rocks.name = 'RockProps';
    this.rockGroup.add(this.rocks);

    this.assetLoader.loadGltfIfAvailable(rockConfig.modelPath)
      .then((gltf) => {
        if (!gltf) {
          console.warn(`Unable to load rock model ${rockConfig.modelPath}.`);
          return;
        }

        const rocks = new Rocks(gltf.scene, this.track, rockConfig);
        this.rocks.add(rocks.group);
      })
      .catch((error) => {
        console.warn('Unable to create imported rock props.', error);
      });
  }

  createForest() {
    this.forest = new Forest(this.track, [this.pitArea, this.startGate]);
    this.treeGroup.add(this.forest.group);
  }

  createPlayerCar() {
    this.playerCar = new Car({
      raceTrack: this.track,
      assetLoader: this.assetLoader,
    });
    this.scene.add(this.playerCar.group);
    this.parkedCars = new THREE.Group();
    this.parkedCars.name = 'ParkedCars';
    this.pitArea.group.add(this.parkedCars);
    this.playerCar.initialize().then(() => this.updateParkedCars());
  }

  createRaceController() {
    this.inputController = new InputController({
      modeManager: this.modeManager,
      environmentSystem: this.environmentSystem,
      renderModeSystem: this.renderModeSystem,
      transformSystem: this.transformSystem,
      focusExploreCamera: () => this.focusExploreCamera(),
      raceCameraActions: {
        sideCheck: (active) => this.raceController?.setHeldCameraCheck(
          RaceCameraMode.SIDE_CHECK,
          active,
        ),
        rearCheck: (active) => this.raceController?.setHeldCameraCheck(
          RaceCameraMode.REAR_CHECK,
          active,
        ),
      },
    });
    this.raceController = new RaceController({
      car: this.playerCar,
      camera: this.camera,
      inputController: this.inputController,
    });
  }

  getCarOptions() {
    return this.playerCar.getCarOptions();
  }

  getActiveCarId() {
    return this.playerCar.getActiveCarId();
  }

  async selectActiveCar(carId) {
    if (carId === this.playerCar.getActiveCarId()) {
      return;
    }

    // Active car selection swaps only the visual model under the existing drivable root.
    const changed = await this.playerCar.setActiveCar(carId);

    if (!changed) {
      return;
    }

    this.raceController.resetInputState();
    this.raceController.resetRaceSession();
    await this.updateParkedCars();
    this.applyEnvironment(this.environmentSystem.currentMode);
  }

  async updateParkedCars() {
    if (!this.parkedCars) {
      return;
    }

    this.parkedCars.clear();
    const activeCarId = this.playerCar.getActiveCarId();
    const parkedCarId = activeCarId === 'green' ? 'redgray' : 'green';
    const definition = this.playerCar.getCarDefinition(parkedCarId);

    if (!definition) {
      return;
    }

    const parkedCar = await this.playerCar.createParkedCar(parkedCarId, definition.parked);

    if (parkedCar) {
      this.parkedCars.add(parkedCar);
    }
  }

  applyMode(mode, previousMode) {
    if (mode === ApplicationMode.RACE) {
      this.exploreTransitionActive = false;
      this.controls.enabled = false;
      this.transformSystem.setEnabled(false);
      this.raceController.resetInputState();
      this.raceController.resetRaceSession();
      this.raceController.startCameraTransition(this.controls.target);
      return;
    }

    this.transformSystem.setEnabled(true);
    this.raceController.resetInputState();

    if (previousMode === ApplicationMode.RACE) {
      this.startExploreTransition();
    } else {
      this.controls.enabled = true;
      this.resetExploreCamera();
    }
  }

  startExploreTransition() {
    this.exploreTransitionActive = true;
    this.exploreTransitionElapsed = 0;
    this.exploreTransitionStartPosition.copy(this.camera.position);
    this.exploreTransitionStartTarget.copy(this.raceController.currentLookTarget);
    this.exploreTransitionEndPosition.copy(this.cameraManager.defaults.position);
    this.exploreTransitionEndTarget.copy(this.cameraManager.defaults.target);
    this.controls.enabled = false;
  }

  updateExploreTransition(deltaSeconds) {
    this.exploreTransitionElapsed += deltaSeconds;
    const duration = 1.6;
    const progress = THREE.MathUtils.clamp(this.exploreTransitionElapsed / duration, 0, 1);
    const easedProgress = THREE.MathUtils.smoothstep(progress, 0, 1);

    this.camera.position.lerpVectors(
      this.exploreTransitionStartPosition,
      this.exploreTransitionEndPosition,
      easedProgress,
    );

    const currentLookTarget = new THREE.Vector3();
    currentLookTarget.lerpVectors(
      this.exploreTransitionStartTarget,
      this.exploreTransitionEndTarget,
      easedProgress,
    );
    this.camera.lookAt(currentLookTarget);
    this.controls.target.copy(currentLookTarget);

    if (progress >= 1) {
      this.exploreTransitionActive = false;
      this.controls.enabled = true;
      this.resetExploreCamera();
    }
  }

  focusExploreCamera() {
    const selectedRoot = this.transformSystem.getSelectedRoot();

    if (!selectedRoot) {
      this.resetExploreCamera();
      return;
    }

    const bounds = new THREE.Box3().setFromObject(selectedRoot);

    if (bounds.isEmpty()) {
      this.resetExploreCamera();
      return;
    }

    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3()).length();
    const distance = THREE.MathUtils.clamp(
      size * orbitControlsConfig.focusDistanceMultiplier,
      orbitControlsConfig.minFocusDistance,
      orbitControlsConfig.maxFocusDistance,
    );
    const viewDirection = new THREE.Vector3()
      .subVectors(this.camera.position, this.controls.target);

    if (viewDirection.lengthSq() === 0) {
      viewDirection.set(1, 0.55, 1);
    }

    viewDirection.normalize();
    this.controls.target.copy(center);
    this.controls.target.y = Math.max(this.controls.target.y, 0);
    this.camera.position.copy(center).addScaledVector(viewDirection, distance);
    this.clampExploreCameraToGround();
    this.camera.lookAt(this.controls.target);
    this.controls.update();
  }

  resetExploreCamera() {
    this.cameraManager.resetToExploreView();
    this.controls.target.copy(this.cameraManager.defaults.target);
    this.clampExploreCameraToGround();
    this.controls.update();
  }

  clampExploreCameraToGround() {
    this.controls.target.y = Math.max(this.controls.target.y, 0);
    this.camera.position.y = Math.max(
      this.camera.position.y,
      orbitControlsConfig.groundClearance,
    );
  }

  applyEnvironment(mode) {
    const nightEnabled = mode === EnvironmentMode.NIGHT;

    this.lightingSystem.applyEnvironment(mode);
    this.streetLampObjects.forEach((lamp) => lamp.setNightEnabled(nightEnabled));
    this.pitArea.setNightEnabled(nightEnabled);
    this.startGate.setNightEnabled(nightEnabled);
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
    this.renderModeSystem.registerTarget('teapot-trophy', 'Teapot Trophy', this.teapotTrophy.group);
    this.renderModeSystem.registerTarget('road-decorations', 'Road Decorations', this.roadDecorations.group);
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
    this.transformSystem.registerTarget('teapot-trophy', 'Teapot Trophy', this.teapotTrophy.group);
    this.transformSystem.registerTarget('player-car', 'Player Car', this.playerCar.group);
    this.scene.add(this.transformSystem.object);
  }

}
