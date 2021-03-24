import PassengerContainer from './PassengerContainer.js';
import LiftCompartment from './LiftCompartment.js';
import { floorNumberToLocation, locationToFloorNumber } from '../functions/locationTransforms.js';

export default class Lift extends PassengerContainer {
  constructor() {
    super();
    this.compartment = new LiftCompartment();
    this.status = 'idle'; // idle, ascending, descending
    this._location = 0;
    this.maxSpeed = 10; // px/ms
    this.acceleration = 0.1; // px/ms^2
    this.currentSpeed = 0; // px/ms
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
  get stoppingDistance() {
    return this.currentSpeed ** 2 / (2 * this.acceleration) + 1;
  }
  get location() {
    return this._location;
  }
  set location(newLocation) {
    this._location = newLocation;
    this.element.style.transform = `translateY(-${this.location}px)`;
  }
  async goToFloor(floorNum) {
    const targetLocation = floorNumberToLocation(floorNum);
    let start;
    return new Promise(resolve => {
      const animateMovement = timestamp => {
        const arrivedAtTarget = this.ascending ? this.location > targetLocation : this.location < targetLocation;
        if (!arrivedAtTarget) {
          const distanceToTarget = Math.abs(targetLocation - this.location);
          if (distanceToTarget > this.stoppingDistance) {
            this.currentSpeed = Math.min(this.maxSpeed, this.currentSpeed + this.acceleration);
          } else {
            this.currentSpeed -= this.acceleration;
          }
          if (start === undefined) start = timestamp;
          const elapsedTime = timestamp - start;
          if (this.ascending) {
            this.location += this.currentSpeed;
          } else {
            this.location -= this.currentSpeed;
          }
          window.requestAnimationFrame(animateMovement);
        } else {
          this.currentSpeed = 0;
          this.location = targetLocation;
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
