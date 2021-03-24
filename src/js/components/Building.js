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
  get nextStop() {
    if (this.lift.isAscending) return this.nextAscendingStopExclusive ?? this.highestDescendingCall;
    if (this.lift.isDescending) return this.nextDescendingStopExclusive ?? this.lowestAscendingCall;
    return this.lowestAscendingCall ?? this.highestDescendingCall;
  }
  get lowestAscendingCall() {
    const floor = this.floors.find(floor => floor.calling.up);
    return floor ? floor.floorNumber : null;
  }
  get highestDescendingCall() {
    const floor = [...this.floors].reverse().find(floor => floor.calling.down);
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
  async summonLift(floorNum) {
    if (!this.lift.isIdle) return;
    await this.cycleLift(floorNum);
    this.lift.direction = 'idle';
  }
  setLiftDirection(floorNum) {
    if (this.lift.isAscending) {
      if (this.nextAscendingStopInclusive) return;
      if (this.highestDescendingCall > this.lift.currentFloor) return;
      this.lift.direction = 'descending';
    } else if (this.lift.isDescending) {
      if (this.nextDescendingStopInclusive) return;
      if (this.lowestAscendingCall < this.lift.currentFloor) return;
      this.lift.direction = 'ascending';
    } else if (this.lift.isIdle) {
      if (floorNum === this.lift.currentFloor) {
        this.lift.direction = this.floors[floorNum].waitingArea.passengers[0].destination > this.lift.currentFloor ? 'ascending' : 'descending';
      } else {
        this.lift.direction = floorNum > this.lift.currentFloor ? 'ascending' : 'descending';
      }
    }
  }
  async cycleLift(floorNum) {
    this.setLiftDirection(floorNum);
    await this.embarkPassengers();
    await delay(1000);
    if (this.nextStop === null) {
      this.lift.direction = 'idle';
    } else {
      await this.lift.goToFloor(this.nextStop);
      await this.disembarkPassengers();
      await this.cycleLift(null);
    }
  }
  async disembarkPassengers() {
    const criteria = passenger => passenger.destination === this.lift.currentFloor;
    await transferPassengers(this.lift.compartment, this.floors[this.lift.currentFloor].disembarkArea, criteria);
  }
  async embarkPassengers() {
    let criteria;
    if (this.lift.isAscending) {
      criteria = passenger => passenger.destination > this.lift.currentFloor;
    } else {
      criteria = passenger => passenger.destination < this.lift.currentFloor;
    }
    await transferPassengers(this.floors[this.lift.currentFloor].waitingArea, this.lift.compartment, criteria);
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
