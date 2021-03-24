import PassengerContainer from './PassengerContainer.js';
import LiftCompartment from './LiftCompartment.js';
import { floorNumberToLocation, locationToFloorNumber } from '../functions/locationTransforms.js';

export default class Lift extends PassengerContainer {
  constructor() {
    super();
    this.compartment = new LiftCompartment();
    this.status = 'idle'; // idle, ascending, descending
    this._location = 0;
    this.maxSpeed = 0.3; // px/ms
    this.acceleration = 0.0005; // px/ms^2
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
    return this.currentSpeed ** 2 / (2 * this.acceleration);
  }
  get location() {
    return this._location;
  }
  set location(newLocation) {
    this._location = newLocation;
    this.element.style.transform = `translateY(-${newLocation}px)`;
  }
  async goToFloor(floorNum) {
    const targetLocation = floorNumberToLocation(floorNum);
    let lastTimestamp;
    return new Promise(resolve => {
      const animateMovement = currentTimestamp => {
        const arrivedAtTarget = this.ascending ? this.location > targetLocation : this.location < targetLocation;
        if (!arrivedAtTarget) {
          if (lastTimestamp === undefined) lastTimestamp = currentTimestamp;
          const frameTime = currentTimestamp - lastTimestamp;
          const distanceToTarget = Math.abs(targetLocation - this.location);
          if (distanceToTarget > this.stoppingDistance) {
            this.currentSpeed = Math.min(this.maxSpeed, this.currentSpeed + this.acceleration * frameTime);
          } else {
            this.currentSpeed -= this.acceleration * frameTime;
          }
          // console.log(this.currentSpeed.toFixed(3));
          if (this.ascending) {
            this.location += this.currentSpeed * frameTime;
          } else {
            this.location -= this.currentSpeed * frameTime;
          }
          lastTimestamp = currentTimestamp;
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
