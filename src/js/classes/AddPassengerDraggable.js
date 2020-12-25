// import { dragstart_handler } from '../functions/dragHandlers.js';

export default class AddPassengerDraggable {
  constructor(destination) {
    this.destination = +destination;
  }
  render() {
    return `<li class="passenger" data-floor="${this.destination}" draggable="true">
              <img src="img/passenger.svg" onload="SVGInject(this)" />
            </li>`;
  }
  // render() {
  //   return `<li class="passenger" data-floor="${this.destination}" draggable="true" ondragstart="dragstart_handler(event)">
  //             <img src="img/passenger.svg" onload="SVGInject(this)" />
  //           </li>`;
  // }
}