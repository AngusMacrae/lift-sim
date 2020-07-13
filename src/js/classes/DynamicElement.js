import componentId from '../function/idGenerator.js';

export default class DynamicElement {
  constructor() {
    this.id = componentId.next().value;
  }
  renderInPlace() {
    this.element.outerHTML = this.render();
  }
}
