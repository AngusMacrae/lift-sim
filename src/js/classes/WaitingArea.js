import PassengerContainer from './PassengerContainer.js';
import Passenger from './Passenger.js';
import {
  dragover_handler,
  drop_handler
} from '../functions/dragHandlers.js';
import building from '../script.js';

export default class WaitingArea extends PassengerContainer {
  constructor() {
    super();
  }
  getCallingStatus(floorNum) {
    return {
      up: this.passengers.some(passenger => passenger.destination > floorNum),
      down: this.passengers.some(passenger => passenger.destination < floorNum),
    };
  }
  addPassenger(destination) {
    this.passengers.push(new Passenger(destination));
    // building.lift.call(new Call(this.floorNumber, destination > this.floorNumber));
  }
  initialiseEventListeners() {
    this.element.querySelector('.waiting-area').addEventListener("dragover", event => dragover_handler(event));
    this.element.querySelector('.waiting-area').addEventListener("drop", event => drop_handler(event, building));
  }
  render() {
    let classString = '';
    classString += this.getCallingStatus.up ? ' call-up' : '';
    classString += this.getCallingStatus.down ? ' call-down' : '';

    return `<div data-id="${this.id}" class="waiting-area-container${classString}">
              <div class="call-arrow-container">
                <img class="arrow arrow-up" src="img/up-arrow.svg" onload="SVGInject(this)" />
                <img class="arrow arrow-down" src="img/up-arrow.svg" onload="SVGInject(this)" />
              </div>
              <ul class="waiting-area">
                ${this.passengers.map(passenger => passenger.render()).join('')}
              </ul>
            </div>`;
    // return `<div data-id="${this.id}" class="waiting-area-container${classString}">
    //           <div class="call-arrow-container">
    //             <img class="arrow arrow-up" src="img/up-arrow.svg" onload="SVGInject(this)" />
    //             <img class="arrow arrow-down" src="img/up-arrow.svg" onload="SVGInject(this)" />
    //           </div>
    //           <ul class="waiting-area" ondrop="drop_handler(event)" ondragover="dragover_handler(event)">
    //             ${this.passengers.map(passenger => passenger.render()).join('')}
    //           </ul>
    //         </div>`;
  }
}
