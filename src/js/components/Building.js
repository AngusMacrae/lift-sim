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
  get ascendingCalls() {
    return this.floors
      .map((floor, index) => {
        if (floor.calling.up == true) {
          return index;
        } else {
          return -1;
        }
      })
      .filter(floorNum => floorNum != -1);
  }
  get descendingCalls() {
    return this.floors
      .map((floor, index) => {
        if (floor.calling.down == true) {
          return index;
        } else {
          return -1;
        }
      })
      .filter(floorNum => floorNum != -1);
  }
  async summonLift() {
    if (this.lift.status === 'idle') {
      this.lift.status = 'working';
      this.cycleLift();
    }
  }
  async cycleLift() {
    let passengerDestinations, callingFloors, queue, highest, lowest;

    if (this.lift.ascending) {
      passengerDestinations = this.lift.passengerDestinations.filter(floor => floor > this.lift.currentFloor);
      callingFloors = this.ascendingCalls.filter(floor => floor > this.lift.currentFloor);
      queue = [...new Set([...passengerDestinations, ...callingFloors])].sort();
      console.log(queue);
      console.log(this.lift.ascending);
      if (queue.length === 0) {
        highest = Math.max(...this.descendingCalls);
        if (highest === -Infinity) {
          if (this.ascendingCalls.length) {
            this.lift.ascending = false;
            this.cycleLift();
          } else {
            this.lift.status = 'idle';
          }
        } else {
          this.lift.ascending = highest > this.lift.currentFloor;
          await this.lift.goToFloor(highest);
          this.lift.ascending = false;
          await this.exchangePassengers();
          this.cycleLift();
        }
      } else {
        await this.lift.goToFloor(queue[0]);
        await this.exchangePassengers();
        this.cycleLift();
      }
    } else if (this.lift.descending) {
      passengerDestinations = this.lift.passengerDestinations.filter(floor => floor < this.lift.currentFloor);
      callingFloors = this.descendingCalls.filter(floor => floor < this.lift.currentFloor);
      queue = [...new Set([...passengerDestinations, ...callingFloors])].sort().reverse();
      console.log(queue);
      console.log(this.lift.ascending);
      if (queue.length === 0) {
        lowest = Math.min(...this.ascendingCalls);
        if (lowest === Infinity) {
          if (this.descendingCalls.length) {
            this.lift.ascending = true;
            this.cycleLift();
          } else {
            this.lift.status = 'idle';
          }
        } else {
          this.lift.ascending = lowest > this.lift.currentFloor;
          await this.lift.goToFloor(lowest);
          this.lift.ascending = true;
          await this.exchangePassengers();
          this.cycleLift();
        }
      } else {
        await this.lift.goToFloor(queue[0]);
        await this.exchangePassengers();
        this.cycleLift();
      }
    }
  }
  async exchangePassengers() {
    return new Promise(async resolve => {
      const currentFloorNum = this.lift.currentFloor;
      const currentFloor = this.floors[currentFloorNum];
      let callback, disembarkingPassenger, embarkingPassenger;

      callback = passenger => passenger.destination === currentFloorNum;
      while (true) {
        disembarkingPassenger = await this.lift.compartment.removePassenger(callback);
        if (disembarkingPassenger) {
          currentFloor.disembarkArea.addPassenger(disembarkingPassenger);
        } else {
          break;
        }
      }

      if (this.lift.ascending) {
        callback = passenger => passenger.destination > currentFloorNum;
      } else if (this.lift.descending) {
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
      resolve();
    });
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
