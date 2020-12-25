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
  get calls() {
    return this.floors.map(floor => floor.calling);
  }
  get destinationQueue() {
    return [...this.calls.list.map(call => call.origin), ...this.passengers.map(passenger => passenger.destination)];
  }
  summonLift(newCall) {
    if (this.destination == null) {
      // if lift is idle
      this.calculateDirection(this.currentFloor);
      this.calculateDestination(this.currentFloor);
      window.requestAnimationFrame(building.lift.move);
    } else {
      // if newCall is on current path
      // and outside stopping distance
      let currentFloorLoc = locationToFloorNumber(this.currentLocation, this.ascending);
      if ((this.ascending && currentFloorLoc < newCall.origin) || (!this.ascending && currentFloorLoc > newCall.origin)) {
        this.calculateDestination(this.currentFloor);
      }
    }
  }
  exchangePassengers(currentFloor) {
    return new Promise(async resolve => {
      this.currentFloor = currentFloor;
      this.calculateDirection(currentFloor); // needs currentFloorNumber and floorObj
      await this.dropPassengers(currentFloor); // needs currentFloorNumber
      await this.loadPassengers(currentFloor); // needs currentFloorNumber and floorObj
      await delay(1000);
      this.pruneCallQueue(currentFloor); // needs currentFloorNumber
      this.calculateDestination(currentFloor); // needs currentFloorNumber
      resolve();
    });
  }
  calculateDirection(currentFloor) {
    if (this.ascending) {
      const highestFloor = Math.max(...this.destinationQueue);
      if (highestFloor <= currentFloor && building.floors[currentFloor].calling.up == false) {
        this.ascending = false;
      }
    } else {
      const lowestFloor = Math.min(...this.destinationQueue);
      if (lowestFloor >= currentFloor && building.floors[currentFloor].calling.down == false) {
        this.ascending = true;
      }
    }
  }
  dropPassengers(currentFloor) {
    return new Promise(async resolve => {
      while (true) {
        const passengerIndex = this.passengers.findIndex(passenger => passenger.destination == currentFloor);
        if (passengerIndex == -1) {
          resolve();
          break;
        } else {
          await delay(1000);
          const passengerToDrop = this.passengers.splice(passengerIndex, 1)[0];
          // push passengerToDrop to building.floors[currentFloor].alightPassenger() method
          this.renderInPlace();
        }
      }
    });
  }
  loadPassengers(currentFloor) {
    return new Promise(async resolve => {
      const floor = building.floors[currentFloor];
      // building???
      while (true) {
        const passengerToLoad = await floor.embarkPassenger(this.ascending);
        if (!passengerToLoad) {
          resolve();
          break;
        } else {
          this.passengers.push(passengerToLoad);
          this.renderInPlace();
        }
      }
    });
  }
  pruneCallQueue(currentFloor) {
    this.calls.removeItem(new Call(currentFloor, this.ascending));
  }
  calculateDestination(currentFloor) {
    const calls = this.calls.list;
    const callOriginsInDirection = calls.filter(call => call.ascending == this.ascending).map(call => call.origin);
    const passengerDestinations = this.passengers.map(passenger => passenger.destination);
    let newDestination = Math.min(...[...callOriginsInDirection, ...passengerDestinations].filter(floor => floor > currentFloor == this.ascending));

    if (newDestination == Infinity) {
      newDestination = Math.max(...calls.map(call => call.origin));
    } else if (newDestination == -Infinity) {
      newDestination = Math.min(...calls.map(call => call.origin));
    }

    if (newDestination == Infinity || newDestination == -Infinity) {
      newDestination = null;
    }

    this.destination = newDestination;
    console.log(this);
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
