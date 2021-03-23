import PassengerContainer from './PassengerContainer.js';
import LiftCompartment from './LiftCompartment.js';
import { floorNumberToLocation, locationToFloorNumber } from '../functions/locationTransforms.js';

export default class Lift extends PassengerContainer {
  constructor() {
    super();
    this.compartment = new LiftCompartment();
    this.status = 'idle'; // idle, ascending, descending
    this.location = 0;
    // this.maxSpeed = 20;
    // this.acceleration = 1;
    // this.currentSpeed = 0; // pixels per animation tick
    // this.capacity = 9;
  }
  get ascending() {
    return this.status === 'ascending';
  }
  get descending() {
    return this.status === 'descending';
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
    const targetLocation = floorNumberToLocation(floorNum);
    let start = 0;
    return new Promise(resolve => {
      const animateMovement = timestamp => {
        const arrivedAtTarget = this.ascending ? this.location > targetLocation : this.location < targetLocation;
        if (!arrivedAtTarget) {
          if (start === undefined) start = timestamp;
          const elapsed = timestamp - start;
          if (this.ascending) {
            this.move(1);
          } else {
            this.move(-1);
          }
          window.requestAnimationFrame(animateMovement);
        } else {
          resolve();
        }
      };

      window.requestAnimationFrame(animateMovement);
    });
  }
  render() {
    return `<div data-id="${this.id}" class="lift" style="transform:translateY(-${this.location}px)">
              ${this.compartment.render()}
            </div>`;
  }
}
