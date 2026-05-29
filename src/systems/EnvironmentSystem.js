export const EnvironmentMode = {
  DAY: 'DAY',
  NIGHT: 'NIGHT',
};

export class EnvironmentSystem {
  constructor(initialMode = EnvironmentMode.DAY) {
    this.mode = initialMode;
    this.listeners = new Set();
  }

  get currentMode() {
    return this.mode;
  }

  isNightMode() {
    return this.mode === EnvironmentMode.NIGHT;
  }

  setEnvironment(nextMode) {
    if (!Object.values(EnvironmentMode).includes(nextMode) || nextMode === this.mode) {
      return;
    }

    const previousMode = this.mode;
    this.mode = nextMode;
    this.listeners.forEach((listener) => listener(this.mode, previousMode));
  }

  toggleEnvironment() {
    this.setEnvironment(this.isNightMode() ? EnvironmentMode.DAY : EnvironmentMode.NIGHT);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.mode, null);

    return () => this.listeners.delete(listener);
  }
}
