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
  element() {
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
    this.element().outerHTML = this.render();
  }
}

class Floor {
  constructor(floorNumber) {
    this.waitingPassengers = [];
    this.floorNumber = +floorNumber;
  }
  element() {
    return document.querySelector(`.floor[data-floor="${this.floorNumber}"]`);
  }
  callUp() {
    return this.waitingPassengers.some(passenger => passenger.destination > this.floorNumber);
  }
  callDown() {
    return this.waitingPassengers.some(passenger => passenger.destination < this.floorNumber);
  }
  addPassenger(destination) {
    this.waitingPassengers.push(new Passenger(destination));
    let ascending = destination > this.floorNumber ? true : false;
    lift.call(new Call(this.floorNumber, ascending));
  }
  // removePassenger() {}
  render() {
    let classString = '';
    classString += this.callUp() ? ' call-up' : '';
    classString += this.callDown() ? ' call-down' : '';
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
    this.element().outerHTML = this.render();
  }
}

class Lift {
  constructor() {
    this.passengers = [];
    this.callQueue = [];
    this.destination = null;
    this.ascending = true;
    this.currentFloor = 0;
    this.currentLocation = 0;
    // this.maxSpeed = 20;
    // this.acceleration = 1;
    // this.currentSpeed = 0; // pixels per animation tick
    // this.capacity = 9;
  }
  element() {
    return document.querySelector('.lift');
  }
  destinationQueue() {
    return [...this.callQueue.map(call => call.origin), ...this.passengers.map(passenger => passenger.destination)];
  }
  setLocation(newLocation) {
    this.currentLocation = newLocation;
    this.element().style.transform = `translateY(${newLocation}px)`;
  }
  call(newCall) {
    if (!newCall.occursIn(this.callQueue)) {
      this.callQueue.push(newCall);
    }
    if (this.destination == null) {
      // if lift is idle
      this.setDirection(this.currentFloor);
      this.setDestination(this.currentFloor);
      window.requestAnimationFrame(moveLift);
    } else {
      // if newCall is on current path
      // and outside stopping distance
      let currentFloorLoc = locationToFloorNumber(this.currentLocation, this.ascending);
      if ((this.ascending && currentFloorLoc < newCall.origin) || (!this.ascending && currentFloorLoc > newCall.origin)) {
        this.setDestination(this.currentFloor);
      }
    }
  }
  exchangePassengers(currentFloor) {
    return new Promise(async resolve => {
      this.currentFloor = currentFloor;
      this.setDirection(currentFloor); // needs currentFloorNumber and floorObj
      await this.disembarkPassengers(currentFloor); // needs currentFloorNumber
      await this.embarkPassengers(currentFloor); // needs currentFloorNumber and floorObj
      await delay(1000);
      this.updateCallQueue(currentFloor); // needs currentFloorNumber
      this.setDestination(currentFloor); // needs currentFloorNumber
      resolve();
    });
  }
  setDirection(currentFloor) {
    if (this.ascending) {
      let highest = Math.max(...this.destinationQueue());
      if (highest <= currentFloor && building.floors[currentFloor].callUp() == false) {
        this.ascending = false;
      }
    } else {
      let lowest = Math.min(...this.destinationQueue());
      if (lowest >= currentFloor && building.floors[currentFloor].callDown() == false) {
        this.ascending = true;
      }
    }
  }
  disembarkPassengers(currentFloor) {
    return new Promise(async resolve => {
      while (true) {
        let passengerIndex = this.passengers.findIndex(passenger => passenger.destination == currentFloor);
        if (passengerIndex == -1) {
          resolve();
          break;
        }
        await delay(1000);
        let disembarkingPassenger = this.passengers.splice(passengerIndex, 1)[0];
        // push disembarkingPassenger to building.floors[currentFloor].disembarkingPassengers
        this.renderInPlace();
        // building.floors[currentFloor].renderInPlace();
      }
    });
  }
  embarkPassengers(currentFloor) {
    return new Promise(async resolve => {
      while (true) {
        let passengerIndex = building.floors[currentFloor].waitingPassengers.findIndex(passenger => passenger.destination > currentFloor == this.ascending);
        if (passengerIndex == -1) {
          resolve();
          break;
        }
        await delay(1000);
        let embarkingPassenger = building.floors[currentFloor].waitingPassengers.splice(passengerIndex, 1)[0];
        this.passengers.push(embarkingPassenger);
        this.renderInPlace();
        building.floors[currentFloor].renderInPlace();
      }
    });
  }
  updateCallQueue(currentFloor) {
    this.callQueue = this.callQueue.filter(call => call.origin != currentFloor || call.ascending != this.ascending);
  }
  setDestination(currentFloor) {
    // TODO: cleanup
    // nearest call origin (matching current direction) or passenger destination in current direction
    // if none then furthest call origin
    // approach:
    // filter callQueue for call.ascending == this.ascending
    // then map call => call.origin
    // then filter for origin >/< currentFloor depending on ascending
    // filter this.passengers for destination >/< currentFloor
    // then map passenger => passenger.destination
    // find min/max
    // if infinity, find max over whole call queue
    // if -infinity, find min over whole call queue
    // then, if +/- infinity, set to null
    if (this.ascending) {
      this.destination = Math.min(...this.callQueue.filter(call => call.origin > currentFloor && call.ascending == this.ascending).map(call => call.origin), ...this.passengers.filter(passenger => passenger.destination > currentFloor).map(passenger => passenger.destination));
      if (this.destination == Infinity) {
        this.destination = Math.max(...this.callQueue.map(call => call.origin));
      }
    } else {
      this.destination = Math.max(...this.callQueue.filter(call => call.origin < currentFloor && call.ascending == this.ascending).map(call => call.origin), ...this.passengers.filter(passenger => passenger.destination < currentFloor).map(passenger => passenger.destination));
      if (this.destination == -Infinity) {
        this.destination = Math.min(...this.callQueue.map(call => call.origin));
      }
    }
    if (this.destination == Infinity || this.destination == -Infinity) {
      this.destination = null;
    }
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
    this.element().outerHTML = this.render();
  }
}

class Call {
  constructor(origin, ascending) {
    this.origin = origin;
    this.ascending = ascending;
  }
  occursIn(callsArray) {
    return callsArray.some(call => call.origin == this.origin && call.ascending == this.ascending);
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

  let destinationFloor = lift.destination;
  let currentLocation = lift.currentLocation;
  let destinationLocation = floorNumberToLocation(destinationFloor);
  let newLocation;
  if (lift.ascending) {
    newLocation = currentLocation - 1;
  } else {
    newLocation = currentLocation + 1;
  }

  lift.setLocation(newLocation);

  if (lift.ascending == newLocation < destinationLocation) {
    start = undefined;
    lift.setLocation(destinationLocation);
    await lift.exchangePassengers(destinationFloor);
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
