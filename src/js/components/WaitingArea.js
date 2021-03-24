import PassengerContainer from './PassengerContainer.js';
import Passenger from './Passenger.js';
import { dragover_handler, drop_handler } from '../functions/dragHandlers.js';
import building from '../script.js';

export default class WaitingArea extends PassengerContainer {
  constructor(floorNum) {
    super();
    this.floorNumber = floorNum;
  }
  get callingUp() {
    return this.passengers.some(passenger => passenger.destination > this.floorNumber);
  }
  get callingDown() {
    return this.passengers.some(passenger => passenger.destination < this.floorNumber);
  }
  newPassenger(destination) {
    this.passengers.push(new Passenger(destination));
    this.renderInPlace();
    building.summonLift();
  }
  initialiseEventListeners() {
    this.element.querySelector('.waiting-area').addEventListener('dragover', event => dragover_handler(event));
    this.element.querySelector('.waiting-area').addEventListener('drop', event => drop_handler(event));
  }
  render() {
    const classString = `${this.callingUp ? 'call-up' : ''} ${this.callingDown ? 'call-down' : ''}`;
    return `<div data-id="${this.id}" class="waiting-area-container ${classString}">
              <div class="call-arrow-container">
                <img class="arrow arrow-up" src="img/up-arrow.svg" onload="SVGInject(this)" />
                <img class="arrow arrow-down" src="img/up-arrow.svg" onload="SVGInject(this)" />
              </div>
              <ul class="waiting-area">
                ${this.passengers.map(passenger => passenger.render()).join('')}
              </ul>
            </div>`;
  }
}
