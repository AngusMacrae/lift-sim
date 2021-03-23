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
  get nextAscendingStop() {
    const floorsOnPath = this.floors.filter(floor => floor.floorNumber > this.lift.currentFloor);
    const floor = floorsOnPath.find(floor => floor.calling.up || this.lift.passengerDestinations.includes(floor.floorNumber));
    return floor ? floor.floorNumber : null;
  }
  get nextDescendingStop() {
    const floorsOnPath = [...this.floors.filter(floor => floor.floorNumber < this.lift.currentFloor)].reverse();
    const floor = floorsOnPath.find(floor => floor.calling.down || this.lift.passengerDestinations.includes(floor.floorNumber));
    return floor ? floor.floorNumber : null;
  }
  get nextAscendingStopInclusive() {
    const floorsOnPath = this.floors.filter(floor => floor.floorNumber >= this.lift.currentFloor);
    const floor = floorsOnPath.find(floor => floor.calling.up || this.lift.passengerDestinations.includes(floor.floorNumber));
    return floor ? floor.floorNumber : null;
  }
  get nextDescendingStopInclusive() {
    const floorsOnPath = [...this.floors.filter(floor => floor.floorNumber <= this.lift.currentFloor)].reverse();
    const floor = floorsOnPath.find(floor => floor.calling.down || this.lift.passengerDestinations.includes(floor.floorNumber));
    return floor ? floor.floorNumber : null;
  }
  get lowestAscendingCall() {
    const allFloors = this.floors;
    const floor = allFloors.find(floor => floor.calling.up);
    return floor ? floor.floorNumber : null;
  }
  get highestDescendingCall() {
    const allFloors = [...this.floors].reverse();
    const floor = allFloors.find(floor => floor.calling.down);
    return floor ? floor.floorNumber : null;
  }
  async summonLift(floorNum) {
    if (this.lift.status !== 'idle') return;

    if (floorNum > this.lift.currentFloor) {
      this.lift.status = 'ascending';
    } else if (floorNum < this.lift.currentFloor) {
      this.lift.status = 'descending';
    } else {
      this.lift.status = this.floors[floorNum].waitingArea.passengers[0].destination > this.lift.currentFloor ? 'ascending' : 'descending';
    }
    await this.cycleLift();
    this.lift.status = 'idle';
    // console.log(this.lift.status);
  }
  setLiftStatus() {
    if (this.lift.status === 'ascending') {
      if (this.nextAscendingStopInclusive) return;
      if (this.highestDescendingCall > this.lift.currentFloor) return;
      this.lift.status = 'descending';
    } else if (this.lift.status === 'descending') {
      if (this.nextDescendingStopInclusive) return;
      if (this.lowestAscendingCall < this.lift.currentFloor) return;
      this.lift.status = 'ascending';
    }
  }
  determineNextLiftStop() {
    if (this.lift.status === 'ascending') {
      return this.nextAscendingStop ?? this.highestDescendingCall;
    } else if (this.lift.status === 'descending') {
      return this.nextDescendingStop ?? this.lowestAscendingCall;
    } else if (this.lift.status === 'idle') {
      return this.lowestAscendingCall ?? this.highestDescendingCall;
    }
  }
  async cycleLift() {
    await this.embarkPassengers();
    this.setLiftStatus();
    const nextStop = this.determineNextLiftStop();
    if (nextStop === null) {
      this.lift.status = 'idle';
    } else {
      await this.lift.goToFloor(nextStop);
      await this.disembarkPassengers();
      this.setLiftStatus();
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

    if (this.lift.status === 'ascending') {
      callback = passenger => passenger.destination > currentFloorNum;
    } else if (this.lift.status === 'descending') {
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
