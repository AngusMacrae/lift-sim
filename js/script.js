class Passenger {
  constructor(destination) {
    this.destination = +destination;
  }
  render() {
    return `<li class="passenger" data-floor="${this.destination}">
              <img src="img/passenger.svg" onload="SVGInject(this)" />
            </li>`;
  }
}

class Building {
  constructor(numberOfFloors) {
    this.floors = [];
    for (let i = 0; i < numberOfFloors; i++) {
      this.floors.push(new Floor(i));
    }
  }
  get element() {
    return document.querySelector('.building');
  }
  render() {
    return `<div class="building">
              ${[...this.floors]
                .reverse()
                .map(floor => floor.render())
                .join('')}
              <div class="lift-shaft">
                ${lift.render()}
              </div>
            </div>`;
  }
  renderInPlace() {
    this.element.outerHTML = this.render();
  }
}

class Floor {
  constructor(floorNumber) {
    this.waitingPassengers = [];
    this.floorNumber = +floorNumber;
  }
  get element() {
    return document.querySelector(`.floor[data-floor="${this.floorNumber}"]`);
  }
  get calling() {
    return {
      up: this.waitingPassengers.some(passenger => passenger.destination > this.floorNumber),
      down: this.waitingPassengers.some(passenger => passenger.destination < this.floorNumber),
    };
  }
  addPassenger(destination) {
    this.waitingPassengers.push(new Passenger(destination));
    lift.call(new Call(this.floorNumber, destination > this.floorNumber));
  }
  async embarkPassenger(ascending) {
    const passengerIndex = this.waitingPassengers.findIndex(passenger => passenger.destination > this.floorNumber == ascending);
    if (passengerIndex > -1) {
      const embarkingPassenger = this.waitingPassengers.splice(passengerIndex, 1)[0];
      await delay(1000);
      this.renderInPlace();
      return embarkingPassenger;
    } else {
      return null;
    }
  }
  // removePassenger() {}
  render() {
    let classString = '';
    classString += this.calling.up ? ' call-up' : '';
    classString += this.calling.down ? ' call-down' : '';
    return `<div class="floor${classString}" data-floor="${this.floorNumber}">
              <span class="floor-label">${numberToOrdinal(this.floorNumber)} floor</span>
              <div class="disembark-area-container">
                <ul class="disembark-area"></ul>
              </div>
              <div class="waiting-area-container">
                <div class="call-arrow-container">
                  <img class="arrow arrow-up" src="img/up-arrow.svg" onload="SVGInject(this)" />
                  <img class="arrow arrow-down" src="img/up-arrow.svg" onload="SVGInject(this)" />
                </div>
                <ul class="waiting-area" ondrop="drop_handler(event)" ondragover="dragover_handler(event)">
                  ${this.waitingPassengers.map(passenger => passenger.render()).join('')}
                </ul>
              </div>
            </div>`;
  }
  renderInPlace() {
    this.element.outerHTML = this.render();
  }
}

class Lift {
  constructor() {
    this.passengers = [];
    this.calls = new ItemList();
    this.destination = null;
    this.ascending = true;
    this.currentFloor = 0;
    this.currentLocation = 0;
    // this.maxSpeed = 20;
    // this.acceleration = 1;
    // this.currentSpeed = 0; // pixels per animation tick
    // this.capacity = 9;
  }
  get element() {
    return document.querySelector('.lift');
  }
  get destinationQueue() {
    return [...this.calls.list.map(call => call.origin), ...this.passengers.map(passenger => passenger.destination)];
  }
  setLocation(newLocation) {
    this.currentLocation = newLocation;
    this.element.style.transform = `translateY(${newLocation}px)`;
  }
  call(newCall) {
    // TODO: rework this method
    if (!this.calls.contains(newCall)) {
      this.calls.add(newCall);
    }
    if (this.destination == null) {
      // if lift is idle
      this.calculateDirection(this.currentFloor);
      this.calculateDestination(this.currentFloor);
      window.requestAnimationFrame(moveLift);
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
    return `<div class="lift" style="transform:translateY(${this.currentLocation}px)">
              <ul class="lift-passengers-container">
                ${this.passengers.map(passenger => passenger.render()).join('')}
              </ul>
            </div>`;
  }
  renderInPlace() {
    this.element.outerHTML = this.render();
  }
}

class ItemList {
  constructor() {
    this.list = [];
  }
  contains(newItem) {
    return this.list.some(item => JSON.stringify(item) == JSON.stringify(newItem));
  }
  add(newItem) {
    this.list.push(newItem);
  }
  removeItem(itemToRemove) {
    this.list = this.list.filter(item => JSON.stringify(item) != JSON.stringify(itemToRemove));
  }
}

class Call {
  constructor(origin, ascending) {
    this.origin = +origin;
    this.ascending = ascending;
  }
}

class AddPassengerDraggable {
  constructor(destination) {
    this.destination = +destination;
  }
  render() {
    return `<li class="passenger" data-floor="${this.destination}" draggable="true" ondragstart="dragstart_handler(event)">
              <img src="img/passenger.svg" onload="SVGInject(this)" />
            </li>`;
  }
}

function numberToOrdinal(inputNumber) {
  switch (inputNumber) {
    case 0:
      return 'Gr.';
    case 1:
      return '1st';
    case 2:
      return '2nd';
    case 3:
      return '3rd';
    default:
      return `${inputNumber}th`;
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function floorNumberToLocation(floorNumber) {
  return floorNumber * -109 + 1;
}

function locationToFloorNumber(location, ascending) {
  if (ascending) {
    return Math.ceil(location / -109);
  } else {
    return Math.floor(location / -109);
  }
}

function dragstart_handler(event) {
  event.dataTransfer.setData('text/plain', event.target.dataset.floor);
  event.dataTransfer.dropEffect = 'move';
}

function dragover_handler(event) {
  event.preventDefault();
  // show invalid drop effect if passenger destination is same as dragged floor
  // also add class to floor to show visually
  event.dataTransfer.dropEffect = 'move';
}

function drop_handler(event) {
  event.preventDefault();
  const passengerDestination = event.dataTransfer.getData('text/plain');
  const floorNumber = event.target.closest('.floor').dataset.floor;
  if (passengerDestination != floorNumber) {
    building.floors[floorNumber].addPassenger(passengerDestination);
    building.floors[floorNumber].renderInPlace();
  }
}

async function moveLift(timestamp) {
  if (start === undefined) start = timestamp;
  const elapsed = timestamp - start;

  const destinationLocation = floorNumberToLocation(lift.destination);
  let newLocation;
  if (lift.ascending) {
    newLocation = lift.currentLocation - 1;
  } else {
    newLocation = lift.currentLocation + 1;
  }

  lift.setLocation(newLocation);

  if (lift.ascending == newLocation < destinationLocation) {
    start = undefined;
    lift.setLocation(destinationLocation);
    await lift.exchangePassengers(lift.destination);
    if (lift.destination != null) {
      window.requestAnimationFrame(moveLift);
    }
  } else {
    window.requestAnimationFrame(moveLift);
  }
}

const lift = new Lift();
const building = new Building(5);

let start;

document.querySelector('#building-placeholder').outerHTML = building.render();
document.querySelector('#commands').innerHTML = building.floors
  .map(floor => new AddPassengerDraggable(floor.floorNumber))
  .map(draggable => draggable.render())
  .join('');
