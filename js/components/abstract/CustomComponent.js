import newId from '../../functions/idGenerator.js';

export default class CustomComponent {
  constructor() {
    this.id = newId();
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
