import PassengerContainer from './abstract/PassengerContainer.js';
import LiftCompartment from './LiftCompartment.js';
import { floorNumberToLocation, locationToFloorNumber } from '../functions/locationTransforms.js';
import stoppingDistance from '../functions/stoppingDistance.js';

export default class Lift extends PassengerContainer {
  constructor() {
    super();
    this.compartment = new LiftCompartment();
    this.direction = null; // 'ascending', 'descending', null
    this.currentSpeed = 0; // px/ms
    this.maxSpeed = 0.3; // px/ms
    this.acceleration = 0.0005; // px/ms^2
    this.targetLocation = null; // px
    this._location = 0; // px
  }
  async goToFloor(floorNum) {
    this.targetLocation = floorNumberToLocation(floorNum);
    let previousTimestamp;
    return new Promise(resolve => {
      const move = currentTimestamp => {
        const arrivedAtTarget = this.isAscending ? this.location > this.targetLocation : this.location < this.targetLocation;
        if (!arrivedAtTarget) {
          if (previousTimestamp === undefined) previousTimestamp = currentTimestamp;
          const frameTime = currentTimestamp - previousTimestamp;
          const distanceToTarget = Math.abs(this.targetLocation - this.location);
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
          // console.log(this.location.toFixed(3));
          previousTimestamp = currentTimestamp;
          window.requestAnimationFrame(move);
        } else {
          this.currentSpeed = 0;
          this.location = this.targetLocation;
          this.targetLocation = null;
          resolve();
        }
      };

      window.requestAnimationFrame(move);
    });
  }
  divertToFloor(floorNumber) {
    const distanceToTarget = Math.abs(floorNumberToLocation(floorNumber) - this.location);
    if (distanceToTarget > stoppingDistance(this.currentSpeed, this.acceleration)) {
      this.targetLocation = floorNumberToLocation(floorNumber);
    }
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
