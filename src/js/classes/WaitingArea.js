import PassengerContainer from './PassengerContainer';

export default class WaitingArea extends PassengerContainer {
  constructor() {
    super();
  }
  get element() {
    return document.querySelector(`[data-id="${this.id}"]`);
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
  render() {
    let classString = '';
    classString += this.calling.up ? ' call-up' : '';
    classString += this.calling.down ? ' call-down' : '';
    return `<div class="waiting-area-container${classString}" data-id="${this.id}">
              <div class="call-arrow-container">
                <img class="arrow arrow-up" src="img/up-arrow.svg" onload="SVGInject(this)" />
                <img class="arrow arrow-down" src="img/up-arrow.svg" onload="SVGInject(this)" />
              </div>
              <ul class="waiting-area" ondrop="drop_handler(event)" ondragover="dragover_handler(event)">
                ${this.passengers.map(passenger => passenger.render()).join('')}
              </ul>
            </div>`;
  }
}
