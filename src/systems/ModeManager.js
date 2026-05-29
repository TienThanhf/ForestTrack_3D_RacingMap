export const ApplicationMode = {
  EXPLORE: 'EXPLORE',
  RACE: 'RACE',
};

export class ModeManager {
  constructor(initialMode = ApplicationMode.EXPLORE) {
    this.mode = initialMode;
    this.listeners = new Set();
  }

  get currentMode() {
    return this.mode;
  }

  isExploreMode() {
    return this.mode === ApplicationMode.EXPLORE;
  }

  isRaceMode() {
    return this.mode === ApplicationMode.RACE;
  }

  setMode(nextMode) {
    if (!Object.values(ApplicationMode).includes(nextMode) || nextMode === this.mode) {
      return;
    }

    const previousMode = this.mode;
    this.mode = nextMode;

    this.listeners.forEach((listener) => listener(this.mode, previousMode));
  }

  toggleMode() {
    this.setMode(this.isRaceMode() ? ApplicationMode.EXPLORE : ApplicationMode.RACE);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.mode, null);

    return () => this.listeners.delete(listener);
  }
}
