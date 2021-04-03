import Passenger from './Passenger.js';
import { dragstartHandler } from '../functions/dragHandlers.js';

export default class PassengerDraggable extends Passenger {
  constructor(destination) {
    super(destination);
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
