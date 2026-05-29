import * as THREE from 'three';
import { sceneColors } from '../config/sceneConfig.js';

const RENDERER_SETTINGS = {
  shadowMapType: THREE.PCFShadowMap,
  maxPixelRatio: 2,
};

export class RendererManager {
  constructor(container) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.canvas = this.renderer.domElement;

    this.renderer.setClearColor(sceneColors.background);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, RENDERER_SETTINGS.maxPixelRatio));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = RENDERER_SETTINGS.shadowMapType;

    container.append(this.canvas);
    this.resize(window.innerWidth, window.innerHeight);
  }

  resize(width, height) {
    this.renderer.setSize(width, height, false);
  }
}
