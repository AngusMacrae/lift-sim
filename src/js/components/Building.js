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
  get lowestAscendingStop() {
    const allFloors = this.floors;
    const floor = allFloors.find(floor => floor.calling.up);
    return floor ? floor.floorNumber : null;
  }
  get highestDescendingStop() {
    const allFloors = [...this.floors].reverse();
    const floor = allFloors.find(floor => floor.calling.down);
    return floor ? floor.floorNumber : null;
  }
  async summonLift() {
    if (this.lift.status === 'idle') {
      this.cycleLift();
    }
  }
  async cycleLift() {
    let nextStop;
    if (this.lift.status === 'ascending') {
      nextStop = this.nextAscendingStop ?? this.highestDescendingStop;
    } else if (this.lift.status === 'descending') {
      nextStop = this.nextDescendingStop ?? this.lowestAscendingStop;
    } else if (this.lift.status === 'idle') {
      nextStop = this.lowestAscendingStop ?? this.highestDescendingStop;
    }
    if (nextStop === this.lift.currentFloor) {
      await this.exchangePassengers();
      nextStop = this.lift.passengerDestinations[0];
      this.lift.status = nextStop > this.lift.currentFloor ? 'ascending' : 'descending';
      await this.lift.goToFloor(nextStop);
      await this.exchangePassengers();
      this.cycleLift();
    } else if (nextStop !== null) {
      this.lift.status = nextStop > this.lift.currentFloor ? 'ascending' : 'descending';
      await this.lift.goToFloor(nextStop);
      await this.exchangePassengers();
      this.cycleLift();
    } else {
      this.lift.status === 'idle';
    }
  }
  async exchangePassengers() {
    const currentFloorNum = this.lift.currentFloor;
    const currentFloor = this.floors[currentFloorNum];
    let callback, disembarkingPassenger, embarkingPassenger, firstInQueue;

    callback = passenger => passenger.destination === currentFloorNum;
    while (true) {
      disembarkingPassenger = await this.lift.compartment.removePassenger(callback);
      if (disembarkingPassenger) {
        currentFloor.disembarkArea.addPassenger(disembarkingPassenger);
      } else {
        break;
      }
    }

    if (this.lift.status === 'ascending') {
      callback = passenger => passenger.destination > currentFloorNum;
    } else if (this.lift.status === 'descending') {
      callback = passenger => passenger.destination < currentFloorNum;
    } else if (this.lift.status === 'idle') {
      firstInQueue = currentFloor.waitingArea.passengers[0].destination;
      callback = passenger => passenger.destination > currentFloorNum === firstInQueue > currentFloorNum;
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
