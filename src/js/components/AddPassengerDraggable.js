import DynamicElement from './DynamicElement.js';
import { dragstart_handler } from '../functions/dragHandlers.js';

export default class AddPassengerDraggable extends DynamicElement {
  constructor(destination) {
    super();
    this.destination = +destination;
  }
  initialiseEventListeners() {
    this.element.addEventListener('dragstart', event => dragstart_handler(event));
  }
  render() {
    return `<li data-id="${this.id}" class="passenger" data-floor="${this.destination}" draggable="true">
              <img src="img/passenger.svg" onload="SVGInject(this)" />
            </li>`;
  }
}
