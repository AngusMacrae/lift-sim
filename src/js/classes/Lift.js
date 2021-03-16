import PassengerContainer from './PassengerContainer.js';
import LiftCompartment from './LiftCompartment.js';
import { floorNumberToLocation, locationToFloorNumber } from '../functions/locationTransforms.js';
// import delay from '../functions/delay.js';

export default class Lift extends PassengerContainer {
  constructor() {
    super();
    this.compartment = new LiftCompartment();
    this.ascending = true;
    // idle, ascending, descending
    this.status = 'idle';
    this.location = 0;
    // this.maxSpeed = 20;
    // this.acceleration = 1;
    // this.currentSpeed = 0; // pixels per animation tick
    // this.capacity = 9;
  }
  get descending() {
    return !this.ascending;
  }
  get passengerDestinations() {
    return [...new Set(this.compartment.passengers.map(passenger => passenger.destination))];
  }
  get currentFloor() {
    return locationToFloorNumber(this.location, this.ascending);
  }
  move(step) {
    this.location += step;
    this.element.style.transform = `translateY(-${this.location}px)`;
  }
  async goToFloor(floorNum) {
    const targetLoc = floorNumberToLocation(floorNum);
    const start = 0;
    return new Promise(resolve => {
      const runAnimation = timestamp => {
        const inMotion = this.ascending ? this.location < targetLoc : this.location > targetLoc;
        if (inMotion) {
          if (start === undefined) start = timestamp;
          const elapsed = timestamp - start;
          if (this.ascending) {
            this.move(1);
          } else {
            this.move(-1);
          }
          window.requestAnimationFrame(runAnimation);
        } else {
          resolve();
        }
      };

      window.requestAnimationFrame(runAnimation);
    });
  }
  render() {
    return `<div data-id="${this.id}" class="lift" style="transform:translateY(-${this.location}px)">
              ${this.compartment.render()}
            </div>`;
  }
}
