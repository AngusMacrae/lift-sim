import componentId from '../functions/idGenerator.js';

export default class DynamicElement {
  constructor() {
    this.id = '' + componentId.next().value;
  }
  get element() {
    return document.querySelector(`[data-id="${this.id}"]`);
  }
  initialiseEventListeners() {}
  render() {
    // return `<example data-id="${this.id}"></example>`;
    return ``;
  }
  renderInPlace() {
    this.element.outerHTML = this.render();
    this.initialiseEventListeners();
  }
}