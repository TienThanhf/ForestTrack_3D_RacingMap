import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class AssetLoader {
  constructor() {
    this.gltfLoader = new GLTFLoader();
  }

  async loadGltfIfAvailable(path) {
    if (!(await this.assetExists(path))) {
      return null;
    }

    return this.loadGltf(path);
  }

  async assetExists(path) {
    if (typeof fetch !== 'function') {
      return false;
    }

    try {
      const response = await fetch(path, { method: 'HEAD' });
      const contentType = response.headers.get('content-type') || '';

      return response.ok && !contentType.includes('text/html');
    } catch {
      return false;
    }
  }

  loadGltf(path) {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(path, resolve, undefined, reject);
    });
  }
}
