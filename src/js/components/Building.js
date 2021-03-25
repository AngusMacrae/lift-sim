import DynamicElement from './DynamicElement.js';
import Lift from './Lift.js';
import Floor from './Floor.js';
import delay from '../functions/delay.js';
import transferPassengers from '../functions/transferPassengers.js';

export default class Building extends DynamicElement {
  constructor(numberOfFloors) {
    super();
    this.lift = new Lift();
    this.floors = [];
    for (let i = 0; i < numberOfFloors; i++) {
      this.floors.push(new Floor(i));
    }
  }
  async summonLift(floorNumber) {
    if (this.lift.isIdle) {
      await this.cycleLift();
      this.lift.direction = null;
    } else if (floorNumber === this.nextStop) {
      this.lift.divertToFloor(floorNumber);
    }
  }
  async cycleLift() {
    this.lift.direction = this.nextLiftDirection;
    await this.embarkPassengers();
    if (this.nextStop !== null) {
      await delay(1000);
      await this.lift.goToFloor(this.nextStop);
      await this.disembarkPassengers();
      await this.cycleLift();
    }
  }
  async disembarkPassengers() {
    const criteria = passenger => passenger.destination === this.lift.currentFloor;
    await transferPassengers(this.lift.compartment, this.floors[this.lift.currentFloor].disembarkArea, criteria);
  }
  async embarkPassengers() {
    const criteria = passenger => passenger.destination > this.lift.currentFloor === this.lift.isAscending;
    await transferPassengers(this.floors[this.lift.currentFloor].waitingArea, this.lift.compartment, criteria);
  }
  get nextLiftDirection() {
    if (this.lift.isAscending) {
      return this.nextAscendingStopInclusive === null ? 'descending' : 'ascending';
    }
    if (this.lift.isDescending) {
      return this.nextDescendingStopInclusive === null ? 'ascending' : 'descending';
    }
    if (this.nextStop === this.lift.currentFloor) {
      return this.floors[this.lift.currentFloor].calling.ascending ? 'ascending' : 'descending';
    } else {
      return this.nextStop > this.lift.currentFloor ? 'ascending' : 'descending';
    }
  }
  get nextStop() {
    if (this.lift.isAscending) return this.nextAscendingStopExclusive ?? this.highestDescendingCall;
    if (this.lift.isDescending) return this.nextDescendingStopExclusive ?? this.lowestAscendingCall;
    return this.lowestAscendingCall ?? this.highestDescendingCall;
  }
  get lowestAscendingCall() {
    const floor = this.floors.find(floor => floor.calling.ascending);
    return floor ? floor.floorNumber : null;
  }
  get highestDescendingCall() {
    const floor = [...this.floors].reverse().find(floor => floor.calling.descending);
    return floor ? floor.floorNumber : null;
  }
  get nextAscendingStopExclusive() {
    const floorsOnPath = this.floors.filter(floor => floor.floorNumber > this.lift.currentFloor);
    return this.nextStopOnPath(floorsOnPath, 'ascending');
  }
  get nextAscendingStopInclusive() {
    const floorsOnPath = this.floors.filter(floor => floor.floorNumber >= this.lift.currentFloor);
    return this.nextStopOnPath(floorsOnPath, 'ascending');
  }
  get nextDescendingStopExclusive() {
    const floorsOnPath = [...this.floors.filter(floor => floor.floorNumber < this.lift.currentFloor)].reverse();
    return this.nextStopOnPath(floorsOnPath, 'descending');
  }
  get nextDescendingStopInclusive() {
    const floorsOnPath = [...this.floors.filter(floor => floor.floorNumber <= this.lift.currentFloor)].reverse();
    return this.nextStopOnPath(floorsOnPath, 'descending');
  }
  nextStopOnPath(floorsOnPath, direction) {
    const floor = floorsOnPath.find(floor => floor.calling[direction] || this.lift.passengerDestinations.includes(floor.floorNumber));
    return floor ? floor.floorNumber : null;
  }
  render() {
    return `<div data-id="${this.id}" class="building">
              ${[...this.floors]
                .reverse()
                .map(floor => floor.render())
                .join('')}
              <div class="lift-shaft">
                ${this.lift.render()}
              </div>
            </div>`;
  }
}
