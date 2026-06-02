import * as THREE from 'three';
import { pitAreaConfig } from '../config/environmentConfig.js';

export class PitArea {
  constructor(raceTrack, config = pitAreaConfig) {
    this.raceTrack = raceTrack;
    this.config = config;
    this.group = new THREE.Group();
    this.group.name = 'PitArea';
    this.interiorLights = [];
    this.interiorLightMaterials = [];
    this.serviceLights = [];
    this.serviceLightMaterials = [];

    this.anchor = this.getTrackAnchor(config.trackT, config.side, config.lateralOffset);
    this.group.position.copy(this.anchor.position);
    this.group.rotation.y = Math.atan2(this.anchor.tangent.x, this.anchor.tangent.z);

    this.createPitDecorations();
    this.createPlatform();
    this.createGarageWalls();
    this.createPosts();
    this.createRoof();
    this.createInteriorLights();
    this.createForestTrackSign();
  }

  getTrackAnchor(t, side, lateralOffset) {
    const center = this.raceTrack.getPointAt(t);
    const tangent = this.raceTrack.getTangentAt(t);
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const outward = normal.clone().multiplyScalar(side);
    const position = center.clone().addScaledVector(outward, lateralOffset);

    return { center, tangent, outward, position };
  }

  createPlatform() {
    const geometry = new THREE.BoxGeometry(
      this.config.platform.width,
      this.config.platform.height,
      this.config.platform.length,
    );
    const material = new THREE.MeshLambertMaterial({ color: this.config.platform.color });
    const platform = new THREE.Mesh(geometry, material);

    platform.position.y = this.config.platform.height / 2;
    platform.castShadow = true;
    platform.receiveShadow = true;

    this.group.add(platform);
  }

  createPitDecorations() {
    this.createPitFloor();
    this.createServiceMarkings();
    this.createSpareTireStack();
    this.createToolBoxes();
    this.createFuelBarrels();
    this.createServiceShelf();
    this.createServiceLamps();
  }

  createPitFloor() {
    const { floor } = this.config.decorations;
    const geometry = new THREE.BoxGeometry(floor.width, floor.height, floor.length);
    const material = new THREE.MeshLambertMaterial({ color: floor.color });
    const floorMesh = new THREE.Mesh(geometry, material);

    floorMesh.name = 'PitConcreteServiceFloor';
    floorMesh.position.y = floor.height / 2;
    floorMesh.receiveShadow = true;

    this.group.add(floorMesh);
  }

  createServiceMarkings() {
    const { platform } = this.config;
    const { markings } = this.config.decorations;
    const material = new THREE.MeshBasicMaterial({ color: markings.color });
    const y = platform.height + markings.height / 2 + 0.012;
    const bayWidth = 2.35;
    const bayLength = 4.4;

    // Move these local x/z values to adjust pit bay markings without touching the road.
    [-1.35, 1.35].forEach((x) => {
      this.addFloorMarking(material, x, y, 0.4, markings.lineWidth, bayLength);
      this.addFloorMarking(material, x - bayWidth / 2, y, 0.4, markings.lineWidth, bayLength);
      this.addFloorMarking(material, x + bayWidth / 2, y, 0.4, markings.lineWidth, bayLength);
      this.addFloorMarking(material, x, y, 0.4 - bayLength / 2, bayWidth, markings.lineWidth);
    });
  }

  addFloorMarking(material, x, y, z, width, length) {
    const geometry = new THREE.BoxGeometry(width, 0.024, length);
    const marking = new THREE.Mesh(geometry, material);

    marking.name = 'PitServiceMarking';
    marking.position.set(x, y, z);

    this.group.add(marking);
  }

  createSpareTireStack() {
    const { tireStack } = this.config.decorations;
    const geometry = new THREE.TorusGeometry(tireStack.tireRadius, tireStack.tubeRadius, 8, 14);
    const material = new THREE.MeshLambertMaterial({ color: tireStack.color });

    for (let index = 0; index < tireStack.count; index += 1) {
      const tire = new THREE.Mesh(geometry, material);

      tire.name = `PitSpareTire${index + 1}`;
      tire.position.copy(tireStack.position);
      tire.position.y += index * tireStack.spacing;
      tire.rotation.x = Math.PI / 2;
      tire.castShadow = true;
      tire.receiveShadow = true;

      this.group.add(tire);
    }
  }

  createToolBoxes() {
    this.config.decorations.toolBoxes.forEach((toolBox, index) => {
      const geometry = new THREE.BoxGeometry(toolBox.size.x, toolBox.size.y, toolBox.size.z);
      const material = new THREE.MeshLambertMaterial({ color: toolBox.color });
      const handleGeometry = new THREE.BoxGeometry(toolBox.size.x * 0.48, 0.08, 0.08);
      const handleMaterial = new THREE.MeshLambertMaterial({ color: 0xf7f2d5 });
      const box = new THREE.Mesh(geometry, material);
      const handle = new THREE.Mesh(handleGeometry, handleMaterial);

      box.name = `PitToolBox${index + 1}`;
      box.position.copy(toolBox.position);
      box.castShadow = true;
      box.receiveShadow = true;

      handle.position.set(0, toolBox.size.y / 2 + 0.06, 0);
      handle.castShadow = true;
      box.add(handle);

      this.group.add(box);
    });
  }

  createFuelBarrels() {
    const barrelGeometry = new THREE.CylinderGeometry(0.24, 0.24, 0.72, 10);
    const bandGeometry = new THREE.CylinderGeometry(0.245, 0.245, 0.055, 10);
    const bandMaterial = new THREE.MeshLambertMaterial({ color: 0xf7f2d5 });

    this.config.decorations.barrels.forEach((barrel, index) => {
      const material = new THREE.MeshLambertMaterial({ color: barrel.color });
      const barrelGroup = new THREE.Group();
      const body = new THREE.Mesh(barrelGeometry, material);

      barrelGroup.name = `PitFuelBarrel${index + 1}`;
      barrelGroup.position.copy(barrel.position);
      body.castShadow = true;
      body.receiveShadow = true;
      barrelGroup.add(body);

      [-0.22, 0.22].forEach((y) => {
        const band = new THREE.Mesh(bandGeometry, bandMaterial);

        band.position.y = y;
        band.castShadow = true;
        band.receiveShadow = true;
        barrelGroup.add(band);
      });

      this.group.add(barrelGroup);
    });
  }

  createServiceShelf() {
    const { shelf } = this.config.decorations;
    const frameMaterial = new THREE.MeshLambertMaterial({ color: shelf.color });
    const plankMaterial = new THREE.MeshLambertMaterial({ color: shelf.shelfColor });
    const shelfGroup = new THREE.Group();
    const sideGeometry = new THREE.BoxGeometry(shelf.width, shelf.height, 0.08);
    const plankGeometry = new THREE.BoxGeometry(shelf.width, 0.08, shelf.length);

    shelfGroup.name = 'PitServiceShelf';
    shelfGroup.position.copy(shelf.position);

    [-shelf.length / 2, shelf.length / 2].forEach((z) => {
      const side = new THREE.Mesh(sideGeometry, frameMaterial);

      side.position.z = z;
      side.castShadow = true;
      side.receiveShadow = true;
      shelfGroup.add(side);
    });

    [-0.38, 0.2, 0.72].forEach((y) => {
      const plank = new THREE.Mesh(plankGeometry, plankMaterial);

      plank.position.y = y;
      plank.castShadow = true;
      plank.receiveShadow = true;
      shelfGroup.add(plank);
    });

    this.group.add(shelfGroup);
  }

  createServiceLamps() {
    const { serviceLamps } = this.config.decorations;
    const poleGeometry = new THREE.CylinderGeometry(
      serviceLamps.poleRadius,
      serviceLamps.poleRadius,
      serviceLamps.poleHeight,
      8,
    );
    const bulbGeometry = new THREE.SphereGeometry(serviceLamps.bulbRadius, 10, 8);
    const poleMaterial = new THREE.MeshLambertMaterial({ color: serviceLamps.poleColor });
    const bulbBaseMaterial = new THREE.MeshStandardMaterial({
      color: serviceLamps.bulbColor,
      emissive: serviceLamps.bulbColor,
      emissiveIntensity: 0,
      roughness: 0.4,
    });

    serviceLamps.positions.forEach((position, index) => {
      const lampGroup = new THREE.Group();
      const pole = new THREE.Mesh(poleGeometry, poleMaterial);
      const bulb = new THREE.Mesh(bulbGeometry, bulbBaseMaterial.clone());
      const pointLight = new THREE.PointLight(
        serviceLamps.bulbColor,
        serviceLamps.dayIntensity,
        serviceLamps.distance,
        serviceLamps.decay,
      );

      lampGroup.name = `PitServiceLamp${index + 1}`;
      lampGroup.position.copy(position);
      pole.position.y = -serviceLamps.poleHeight / 2;
      pole.castShadow = true;
      bulb.castShadow = false;
      bulb.receiveShadow = false;
      pointLight.castShadow = false;

      lampGroup.add(pole, bulb, pointLight);
      this.group.add(lampGroup);
      this.serviceLights.push(pointLight);
      this.serviceLightMaterials.push(bulb.material);
    });
  }

  createGarageWalls() {
    const { platform, walls } = this.config;
    const wallMaterial = new THREE.MeshLambertMaterial({ color: walls.color });
    const trimMaterial = new THREE.MeshLambertMaterial({ color: walls.trimColor });
    const doorMaterial = new THREE.MeshLambertMaterial({ color: walls.doorColor });
    // Small low-poly garage walls turn the pit shelter into a clearer trackside building.
    const rearWall = new THREE.Mesh(
      new THREE.BoxGeometry(platform.width, walls.height, walls.thickness),
      wallMaterial,
    );
    const sideWallGeometry = new THREE.BoxGeometry(
      walls.thickness,
      walls.height,
      platform.length * 0.72,
    );
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(walls.doorWidth, walls.doorHeight, walls.thickness * 0.72),
      doorMaterial,
    );
    const trim = new THREE.Mesh(
      new THREE.BoxGeometry(platform.width * 0.92, 0.18, walls.thickness * 1.15),
      trimMaterial,
    );

    rearWall.position.set(0, platform.height + walls.height / 2, -platform.length / 2 + walls.thickness / 2);
    leftWall.position.set(-platform.width / 2 + walls.thickness / 2, platform.height + walls.height / 2, -0.85);
    rightWall.position.set(platform.width / 2 - walls.thickness / 2, platform.height + walls.height / 2, -0.85);
    door.position.set(0, platform.height + walls.doorHeight / 2, platform.length / 2 - walls.thickness * 0.55);
    trim.position.set(0, platform.height + walls.height + 0.18, platform.length / 2 - walls.thickness * 0.55);

    [rearWall, leftWall, rightWall, door, trim].forEach((mesh) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.group.add(mesh);
    });
  }

  createPosts() {
    const geometry = new THREE.CylinderGeometry(
      this.config.posts.radius,
      this.config.posts.radius,
      this.config.posts.height,
      6,
    );
    const material = new THREE.MeshLambertMaterial({ color: this.config.posts.color });
    const postX = this.config.platform.width / 2 - 0.55;
    const postZ = this.config.platform.length / 2 - 0.7;

    [
      [-postX, -postZ],
      [postX, -postZ],
      [-postX, postZ],
      [postX, postZ],
    ].forEach(([x, z]) => {
      const post = new THREE.Mesh(geometry, material);

      post.position.set(x, this.config.platform.height + this.config.posts.height / 2, z);
      post.castShadow = true;
      post.receiveShadow = true;

      this.group.add(post);
    });
  }

  createRoof() {
    const geometry = new THREE.BoxGeometry(
      this.config.roof.width,
      this.config.roof.height,
      this.config.roof.length,
    );
    const material = new THREE.MeshLambertMaterial({ color: this.config.roof.color });
    const roof = new THREE.Mesh(geometry, material);

    roof.position.y = this.config.roof.y;
    roof.castShadow = true;
    roof.receiveShadow = true;

    this.group.add(roof);
  }

  createInteriorLights() {
    const { platform, interiorLights } = this.config;
    const bulbGeometry = new THREE.SphereGeometry(interiorLights.bulbRadius, 10, 8);
    const bulbMaterial = new THREE.MeshStandardMaterial({
      color: interiorLights.bulbColor,
      emissive: interiorLights.emissiveColor,
      emissiveIntensity: 0.55,
      roughness: 0.42,
    });
    const lightX = platform.width / 2 - interiorLights.insetX;
    const lightZ = platform.length / 2 - interiorLights.insetZ;

    [
      [-lightX, -lightZ],
      [lightX, -lightZ],
      [-lightX, lightZ],
      [lightX, lightZ],
    ].forEach(([x, z], index) => {
      const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial.clone());
      const light = new THREE.PointLight(
        interiorLights.bulbColor,
        interiorLights.dayIntensity,
        interiorLights.distance,
        interiorLights.decay,
      );

      bulb.name = `PitShelterInteriorLightBulb${index + 1}`;
      bulb.position.set(x, interiorLights.height, z);
      bulb.castShadow = false;
      bulb.receiveShadow = false;

      light.name = `PitShelterInteriorPointLight${index + 1}`;
      light.position.copy(bulb.position);
      light.castShadow = false;

      this.group.add(bulb, light);
      this.interiorLights.push(light);
      this.interiorLightMaterials.push(bulb.material);
    });
  }

  setNightEnabled(enabled) {
    const { interiorLights } = this.config;
    const intensity = enabled
      ? interiorLights.nightIntensity
      : interiorLights.dayIntensity;

    this.interiorLights.forEach((light) => {
      light.intensity = intensity;
    });

    this.interiorLightMaterials.forEach((material) => {
      material.emissiveIntensity = enabled ? 0.9 : 0.55;
      material.needsUpdate = true;
    });

    this.serviceLights.forEach((light) => {
      light.visible = enabled;
      light.intensity = enabled
        ? this.config.decorations.serviceLamps.nightIntensity
        : this.config.decorations.serviceLamps.dayIntensity;
    });

    this.serviceLightMaterials.forEach((material) => {
      material.emissiveIntensity = enabled ? 1.2 : 0;
      material.needsUpdate = true;
    });
  }

  createSignboard() {
    const geometry = new THREE.BoxGeometry(
      this.config.sign.width,
      this.config.sign.height,
      this.config.sign.depth,
    );
    const material = new THREE.MeshLambertMaterial({ color: this.config.sign.color });
    const sign = new THREE.Mesh(geometry, material);

    sign.position.set(
      -this.config.platform.width / 2 - 0.08,
      this.config.platform.height + 1.25,
      0,
    );
    sign.castShadow = true;
    sign.receiveShadow = true;

    this.group.add(sign);
  }

  createForestTrackSign() {
    const signConfig = this.config.forestTrackSign;
    const signGroup = new THREE.Group();
    const postGeometry = new THREE.BoxGeometry(
      signConfig.postWidth,
      signConfig.postHeight,
      signConfig.postWidth,
    );
    const boardGeometry = new THREE.BoxGeometry(
      signConfig.boardWidth,
      signConfig.boardHeight,
      signConfig.boardDepth,
    );
    const panelGeometry = new THREE.PlaneGeometry(
      signConfig.boardWidth * 0.88,
      signConfig.boardHeight * 0.7,
    );
    const postMaterial = new THREE.MeshLambertMaterial({ color: signConfig.postColor });
    const boardMaterial = new THREE.MeshLambertMaterial({ color: signConfig.boardColor });
    const frameMaterial = new THREE.MeshLambertMaterial({ color: signConfig.frameColor });
    const capMaterial = new THREE.MeshLambertMaterial({ color: signConfig.capColor });
    const panelTexture = this.createForestTrackSignTexture(signConfig);
    const panelMaterial = new THREE.MeshBasicMaterial({
      map: panelTexture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const board = new THREE.Mesh(boardGeometry, boardMaterial);

    signGroup.name = 'ForestTrackSign';
    this.placeForestTrackSign(signGroup, signConfig);
    signGroup.scale.setScalar(signConfig.scale ?? 1);

    // Wooden posts with decorative caps
    [-1, 1].forEach((side) => {
      const post = new THREE.Mesh(postGeometry, postMaterial);

      post.position.set(side * signConfig.postSpacing / 2, -signConfig.boardHeight / 2, 0);
      post.castShadow = true;
      post.receiveShadow = true;
      signGroup.add(post);

      // Post cap: small pyramid top
      const capSize = signConfig.capSize || 0.22;
      const capGeometry = new THREE.ConeGeometry(capSize / 2, capSize * 0.7, 4);
      const cap = new THREE.Mesh(capGeometry, capMaterial);

      cap.position.set(
        side * signConfig.postSpacing / 2,
        -signConfig.boardHeight / 2 + signConfig.postHeight / 2 + capSize * 0.35,
        0,
      );
      cap.rotation.y = Math.PI / 4;
      cap.castShadow = true;
      cap.receiveShadow = true;
      signGroup.add(cap);
    });

    board.castShadow = true;
    board.receiveShadow = true;

    // Frame border around the board
    const fw = signConfig.frameWidth || 0.1;
    const frameHorizontalGeometry = new THREE.BoxGeometry(
      signConfig.boardWidth + fw * 2,
      fw,
      signConfig.boardDepth + 0.02,
    );
    const frameVerticalGeometry = new THREE.BoxGeometry(
      fw,
      signConfig.boardHeight,
      signConfig.boardDepth + 0.02,
    );

    [
      { geo: frameHorizontalGeometry, pos: [0, signConfig.boardHeight / 2 + fw / 2, 0] },
      { geo: frameHorizontalGeometry, pos: [0, -signConfig.boardHeight / 2 - fw / 2, 0] },
      { geo: frameVerticalGeometry, pos: [signConfig.boardWidth / 2 + fw / 2, 0, 0] },
      { geo: frameVerticalGeometry, pos: [-signConfig.boardWidth / 2 - fw / 2, 0, 0] },
    ].forEach(({ geo, pos }) => {
      const framePiece = new THREE.Mesh(geo, frameMaterial);

      framePiece.position.set(pos[0], pos[1], pos[2]);
      framePiece.castShadow = true;
      framePiece.receiveShadow = true;
      signGroup.add(framePiece);
    });

    // Front and back text panels
    const panelFront = new THREE.Mesh(panelGeometry, panelMaterial);
    const panelBack = new THREE.Mesh(panelGeometry, panelMaterial);

    panelFront.position.z = signConfig.boardDepth / 2 + 0.012;
    panelBack.position.z = -(signConfig.boardDepth / 2 + 0.012);
    panelBack.rotation.y = Math.PI;

    signGroup.add(board, panelFront, panelBack);
    this.group.add(signGroup);
  }

  placeForestTrackSign(signGroup, signConfig) {
    const placement = signConfig.trackPlacement;

    if (!placement) {
      signGroup.position.copy(signConfig.position);
      signGroup.rotation.y = signConfig.rotationY ?? 0;
      return;
    }

    const center = this.raceTrack.getPointAt(placement.t);
    const tangent = this.raceTrack.getTangentAt(placement.t);
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const outward = normal.clone().multiplyScalar(placement.side);
    const worldPosition = center.clone().addScaledVector(outward, placement.lateralOffset);
    const inward = outward.clone().multiplyScalar(-1);
    const worldRotationY = Math.atan2(inward.x, inward.z) + (placement.rotationOffset ?? 0);
    const pitRotationY = this.group.rotation.y;

    signGroup.position.copy(worldPosition.sub(this.group.position));
    signGroup.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), -pitRotationY);
    signGroup.position.y = placement.height;
    signGroup.rotation.y = worldRotationY - pitRotationY;
  }

  createForestTrackSignTexture(signConfig) {
    const canvas = document.createElement('canvas');
    const width = 1024;
    const height = 384;
    const context = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    // 1. Gorgeous Dark Forest Gradient Background
    const bgGradient = context.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#0a1d13'); // Extremely dark forest green
    bgGradient.addColorStop(0.5, '#12301f'); // Medium forest green
    bgGradient.addColorStop(1, '#07180e'); // Deep shadow green
    context.fillStyle = bgGradient;
    context.fillRect(0, 0, width, height);

    // Subtle carbon-fiber grid pattern for premium texture
    context.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    context.lineWidth = 1;
    const gridSize = 16;
    for (let x = 0; x < width; x += gridSize) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    // 2. Rich Gold Metallic Borders
    const goldGradient = context.createLinearGradient(0, 0, width, 0);
    goldGradient.addColorStop(0, '#d4af37'); // Classic gold
    goldGradient.addColorStop(0.25, '#fff2a3'); // Bright shine
    goldGradient.addColorStop(0.5, '#aa7c11'); // Dark gold shadow
    goldGradient.addColorStop(0.75, '#ffd700'); // Pure gold
    goldGradient.addColorStop(1, '#d4af37');

    // Outer border
    context.strokeStyle = goldGradient;
    context.lineWidth = 16;
    context.strokeRect(20, 20, width - 40, height - 40);

    // Inner border
    context.strokeStyle = 'rgba(255, 242, 163, 0.6)';
    context.lineWidth = 4;
    context.strokeRect(40, 40, width - 80, height - 80);

    // 3. Premium Corner Diamonds
    const drawDiamond = (cx, cy, r) => {
      context.fillStyle = goldGradient;
      context.beginPath();
      context.moveTo(cx, cy - r);
      context.lineTo(cx + r, cy);
      context.lineTo(cx, cy + r);
      context.lineTo(cx - r, cy);
      context.closePath();
      context.fill();
    };

    const dRadius = 18;
    drawDiamond(40, 40, dRadius);
    drawDiamond(width - 40, 40, dRadius);
    drawDiamond(40, height - 40, dRadius);
    drawDiamond(width - 40, height - 40, dRadius);

    // 4. Elegant Text Shadow & Glow Effect
    context.shadowColor = 'rgba(0, 0, 0, 0.7)';
    context.shadowBlur = 12;
    context.shadowOffsetX = 4;
    context.shadowOffsetY = 6;

    // 5. Main Title Text: "FOREST TRACK" with glossy gold-to-white gradient
    const textGradient = context.createLinearGradient(0, height / 2 - 80, 0, height / 2 + 10);
    textGradient.addColorStop(0, '#ffffff'); // Shiny top
    textGradient.addColorStop(0.3, '#fff2a3'); // Light gold shine
    textGradient.addColorStop(0.7, '#f7c04a'); // Pure gold
    textGradient.addColorStop(1, '#b58900'); // Deep gold base

    context.fillStyle = textGradient;
    context.font = '900 110px "Montserrat", "Trebuchet MS", "Arial Black", sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Draw text with double thick border for 3D outline effect
    context.strokeStyle = '#05120a'; // Ultra dark outline
    context.lineWidth = 14;
    context.strokeText('FOREST TRACK', width / 2, height / 2 - 25);
    context.fillText('FOREST TRACK', width / 2, height / 2 - 25);

    // 6. Subtitle with elegant ribbon decoration or lines
    context.shadowBlur = 0;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;

    // Subtitle background plate
    context.fillStyle = 'rgba(0, 0, 0, 0.45)';
    context.fillRect(width / 2 - 320, height / 2 + 65, 640, 56);
    context.strokeStyle = goldGradient;
    context.lineWidth = 2;
    context.strokeRect(width / 2 - 320, height / 2 + 65, 640, 56);

    // Subtitle text
    context.fillStyle = '#ffffff';
    context.font = 'bold 26px "Montserrat", "Trebuchet MS", sans-serif';
    context.fillText('🏁  P R E M I U M   C I R C U I T  🏁', width / 2, height / 2 + 93);

    const texture = new THREE.CanvasTexture(canvas);

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    return texture;
  }

  getExclusionZones() {
    const padding = this.config.clearancePadding;

    return [
      {
        center: this.anchor.position,
        tangent: this.anchor.tangent,
        outward: this.anchor.outward,
        halfWidth: this.config.roof.width / 2 + padding,
        halfLength: this.config.roof.length / 2 + padding,
      },
    ];
  }
}
