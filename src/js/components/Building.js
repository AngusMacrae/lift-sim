import DynamicElement from './DynamicElement.js';
import Lift from './Lift.js';
import Floor from './Floor.js';
import delay from '../functions/delay.js';

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
    if (this.lift.isAscending) {
      return this.nextAscendingStopExclusive ?? this.highestDescendingCall;
    } else if (this.lift.isDescending) {
      return this.nextDescendingStopExclusive ?? this.lowestAscendingCall;
    } else {
      return this.lowestAscendingCall ?? this.highestDescendingCall;
    }
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

    if (floorNum === this.lift.currentFloor) {
      this.lift.direction = this.floors[floorNum].waitingArea.passengers[0].destination > this.lift.currentFloor ? 'ascending' : 'descending';
    } else {
      this.lift.direction = floorNum > this.lift.currentFloor ? 'ascending' : 'descending';
    }
    await this.cycleLift();
    this.lift.direction = 'idle';
  }
  setLiftDirection() {
    if (this.lift.isAscending) {
      if (this.nextAscendingStopInclusive) return;
      if (this.highestDescendingCall > this.lift.currentFloor) return;
      this.lift.direction = 'descending';
    } else {
      if (this.nextDescendingStopInclusive) return;
      if (this.lowestAscendingCall < this.lift.currentFloor) return;
      this.lift.direction = 'ascending';
    }
  }
  async cycleLift() {
    await this.embarkPassengers();
    this.setLiftDirection();
    if (this.nextStop === null) {
      this.lift.direction = 'idle';
    } else {
      await this.lift.goToFloor(this.nextStop);
      await this.disembarkPassengers();
      this.setLiftDirection();
      await this.cycleLift();
    }
  }
  async disembarkPassengers() {
    const currentFloorNum = this.lift.currentFloor;
    const currentFloor = this.floors[currentFloorNum];
    let callback, disembarkingPassenger;

    callback = passenger => passenger.destination === currentFloorNum;
    while (true) {
      disembarkingPassenger = await this.lift.compartment.removePassenger(callback);
      if (disembarkingPassenger) {
        currentFloor.disembarkArea.addPassenger(disembarkingPassenger);
      } else {
        break;
      }
    }
  }
  async embarkPassengers() {
    const currentFloorNum = this.lift.currentFloor;
    const currentFloor = this.floors[currentFloorNum];
    let callback, embarkingPassenger;
    // console.log(this.lift.status);

    if (this.lift.isAscending) {
      callback = passenger => passenger.destination > currentFloorNum;
    } else {
      callback = passenger => passenger.destination < currentFloorNum;
    }
    while (true) {
      embarkingPassenger = await currentFloor.waitingArea.removePassenger(callback);
      if (embarkingPassenger) {
        this.lift.compartment.addPassenger(embarkingPassenger);
      } else {
        break;
      }
    }
    await delay(1000);
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
