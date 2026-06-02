import { ApplicationMode } from '../systems/ModeManager.js';

export class StartScreen {
  constructor({
    container,
    modeManager,
  }) {
    this.modeManager = modeManager;
    this.element = document.createElement('section');
    this.element.className = 'start-screen';
    this.element.setAttribute('aria-label', 'Start screen');
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');

    const content = document.createElement('div');
    content.className = 'start-screen__content';

    const badge = document.createElement('p');
    badge.className = 'start-screen__badge';
    badge.textContent = 'Low-Poly Racing';

    const title = document.createElement('h1');
    title.className = 'start-screen__title';
    title.textContent = 'Welcome to Forest Track';

    const subtitle = document.createElement('p');
    subtitle.className = 'start-screen__subtitle';
    subtitle.textContent = 'A low-poly 3D racing experience';

    const actions = document.createElement('div');
    actions.className = 'start-screen__actions';

    this.exploreButton = this.createModeButton('Explore', 'start-screen__button--explore');
    this.raceButton = this.createModeButton('Race', 'start-screen__button--race');
    actions.append(this.exploreButton, this.raceButton);

    const scenery = document.createElement('div');
    scenery.className = 'start-screen__scenery';
    scenery.setAttribute('aria-hidden', 'true');
    scenery.append(
      this.createTree(),
      this.createTree(),
      this.createRoad(),
      this.createTree(),
      this.createTree(),
    );

    content.append(badge, title, subtitle, actions, scenery);
    this.element.append(content);
    container.append(this.element);

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.exploreButton.addEventListener('click', () => this.enterMode(ApplicationMode.EXPLORE));
    this.raceButton.addEventListener('click', () => this.enterMode(ApplicationMode.RACE));
    window.addEventListener('keydown', this.handleKeyDown, true);
    this.exploreButton.focus();
  }

  createModeButton(label, modifierClass) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `start-screen__button ${modifierClass}`;
    button.textContent = label;

    return button;
  }

  createTree() {
    const tree = document.createElement('span');
    tree.className = 'start-screen__tree';

    return tree;
  }

  createRoad() {
    const road = document.createElement('span');
    road.className = 'start-screen__road';

    return road;
  }

  enterMode(mode) {
    this.modeManager.setMode(mode);
    this.hide();
  }

  hide() {
    this.element.classList.add('is-hidden');
    this.element.setAttribute('aria-hidden', 'true');
    window.removeEventListener('keydown', this.handleKeyDown, true);

    window.setTimeout(() => {
      this.element.hidden = true;
    }, 320);
  }

  handleKeyDown(event) {
    const canActivateButton = (
      event.target === this.exploreButton
      || event.target === this.raceButton
    ) && ['Enter', 'Space', 'Tab'].includes(event.code);

    if (canActivateButton) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  }
}
