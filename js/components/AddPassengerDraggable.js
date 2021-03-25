import DynamicElement from './DynamicElement.js';
import { dragstartHandler } from '../functions/dragHandlers.js';

export default class AddPassengerDraggable extends DynamicElement {
  constructor(destination) {
    super();
    this.destination = +destination;
  }
  initialiseEventListeners() {
    this.element.addEventListener('dragstart', dragstartHandler);
  }
  render() {
    return `<li data-id="${this.id}" class="passenger" data-floor="${this.destination}" draggable="true">
              <img src="img/passenger.svg" onload="SVGInject(this)" />
            </li>`;
  }
}
