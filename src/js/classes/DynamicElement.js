import componentId from '../functions/idGenerator.js';

export default class DynamicElement {
  constructor() {
    this.id = componentId.next().value;
  }
  get element() {
    return document.querySelector(`[data-id="${this.id}"]`);
  }
  initialiseEventListeners() {}
  render() {
    return `<div data-id="${this.id}"></div>`;
  }
  renderInPlace() {
    this.element.outerHTML = this.render();
    this.initialiseEventListeners();
  }
}
