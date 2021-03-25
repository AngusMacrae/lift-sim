import PassengerContainer from './PassengerContainer.js';
import LiftCompartment from './LiftCompartment.js';
import { floorNumberToLocation, locationToFloorNumber } from '../functions/locationTransforms.js';
import stoppingDistance from '../functions/stoppingDistance.js';

export default class Lift extends PassengerContainer {
  constructor() {
    super();
    this.compartment = new LiftCompartment();
    this.direction = null; // 'ascending', 'descending', null
    this._location = 0;
    this.maxSpeed = 0.3; // px/ms
    this.acceleration = 0.0005; // px/ms^2
    this.currentSpeed = 0; // px/ms
    // this.capacity = 9;
  }
  async goToFloor(floorNum) {
    const targetLocation = floorNumberToLocation(floorNum);
    let lastTimestamp;
    return new Promise(resolve => {
      const animateMovement = currentTimestamp => {
        const arrivedAtTarget = this.isAscending ? this.location > targetLocation : this.location < targetLocation;
        if (!arrivedAtTarget) {
          if (lastTimestamp === undefined) lastTimestamp = currentTimestamp;
          const frameTime = currentTimestamp - lastTimestamp;
          const distanceToTarget = Math.abs(targetLocation - this.location);
          if (distanceToTarget > stoppingDistance(this.currentSpeed, this.acceleration)) {
            this.currentSpeed = Math.min(this.maxSpeed, this.currentSpeed + this.acceleration * frameTime);
          } else {
            this.currentSpeed = Math.max(0.01, this.currentSpeed - this.acceleration * frameTime);
          }
          // console.log(this.currentSpeed.toFixed(3));
          if (this.isAscending) {
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
  get isAscending() {
    return this.direction === 'ascending';
  }
  get isDescending() {
    return this.direction === 'descending';
  }
  get isIdle() {
    return this.direction === null;
  }
  get passengerDestinations() {
    return [...new Set(this.compartment.passengers.map(passenger => passenger.destination))];
  }
  get currentFloor() {
    return locationToFloorNumber(this.location, this.isAscending);
  }
  get location() {
    return this._location;
  }
  set location(newLocation) {
    this._location = newLocation;
    this.element.style.transform = `translateY(-${newLocation}px)`;
  }
  render() {
    return `<div data-id="${this.id}" class="lift" style="transform:translateY(-${this.location}px)">
              ${this.compartment.render()}
            </div>`;
  }
}
