import PassengerContainer from './PassengerContainer.js';
import Passenger from './Passenger.js';
import { dragenterHandler, dragoverHandler, dragleaveHandler, dropHandler } from '../functions/dragHandlers.js';
import building from '../main.js';
import arrowSVG from '../../img/up-arrow.svg';

export default class WaitingArea extends PassengerContainer {
  constructor(floorNum) {
    super();
    this.floorNumber = floorNum;
  }
  newPassenger(destination) {
    this.passengers.push(new Passenger(destination));
    this.renderInPlace();
    building.summonLift(this.floorNumber);
  }
  get callingUp() {
    return this.passengers.some(passenger => passenger.destination > this.floorNumber);
  }
  get callingDown() {
    return this.passengers.some(passenger => passenger.destination < this.floorNumber);
  }
  initialiseEventListeners() {
    this.element.querySelector('.waiting-area').addEventListener('dragenter', dragenterHandler);
    this.element.querySelector('.waiting-area').addEventListener('dragover', dragoverHandler);
    this.element.querySelector('.waiting-area').addEventListener('dragleave', dragleaveHandler);
    this.element.querySelector('.waiting-area').addEventListener('drop', dropHandler);
  }
  render() {
    const classString = `${this.callingUp ? 'call-up' : ''} ${this.callingDown ? 'call-down' : ''}`;
    return `<div data-id="${this.id}" class="waiting-area-container ${classString}">
              <div class="call-arrow-container">
                <img class="arrow arrow-up" src="${arrowSVG}" onload="SVGInject(this)" />
                <img class="arrow arrow-down" src="${arrowSVG}" onload="SVGInject(this)" />
              </div>
              <ul class="waiting-area">
                ${this.passengers.map(passenger => passenger.render()).join('')}
              </ul>
            </div>`;
  }
}
