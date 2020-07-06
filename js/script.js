class Passenger {
  constructor(destination) {
    this.destination = +destination;
  }
  render() {
    return `<li class="passenger" data-destination="${this.destination}">
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
    return document.querySelector(`.floor[data-number="${this.floorNumber}"]`);
  }
  callUp() {
    return this.waitingPassengers.findIndex(passenger => passenger.destination > this.floorNumber) > -1 ? true : false;
  }
  callDown() {
    return this.waitingPassengers.findIndex(passenger => passenger.destination < this.floorNumber) > -1 ? true : false;
  }
  classString() {
    let callUpClass = this.callUp() ? 'call-up' : '';
    let callDownClass = this.callDown() ? 'call-down' : '';
    return `${callUpClass} ${callDownClass}`;
  }
  addPassenger(destination) {
    this.waitingPassengers.push(new Passenger(destination));
    let ascending = destination > this.floorNumber ? true : false;
    lift.call(new Call(this.floorNumber, ascending));
  }
  // removePassenger() {}
  render() {
    return `<div class="floor ${this.classString()}" data-number="${this.floorNumber}">
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
    // filter callQueue for only same direction
    return [...this.callQueue.filter(call => (call.ascending = this.ascending)), ...this.passengers.map(passenger => passenger.destination)];
  }
  setLocation(newLocation) {
    this.currentLocation = newLocation;
    this.element().style.transform = `translateY(${newLocation}px)`;
  }
  call(newCall) {
    let isUnique = this.callQueue.findIndex(call => call.origin == newCall.origin && call.ascending == newCall.ascending);
    if (isUnique == -1) {
      this.callQueue.push(newCall);
    }
    if (this.callQueue.length == 1) {
      this.setDestination(0);
      window.requestAnimationFrame(moveLift);
    }
    // if newCall is on current path
    // and outside stopping distance
    // this.setDestination(hmmm...)
    // window.requestAnimationFrame(moveLift);
  }
  exchangePassengers(currentFloor) {
    return new Promise(async resolve => {
      this.setDirection(currentFloor);
      await this.disembarkPassengers(currentFloor);
      await this.embarkPassengers(currentFloor);
      await this.setDestination(currentFloor);
      resolve();
    });
  }
  setDirection(currentFloor) {
    if (this.ascending) {
      let highest = Math.max(...this.callQueue.map(call => call.origin), ...this.passengers.map(passenger => passenger.destination));
      if (highest <= currentFloor && building.floors[currentFloor].callUp() == false) {
        this.ascending = false;
      }
    } else {
      let lowest = Math.min(...this.callQueue.map(call => call.origin), ...this.passengers.map(passenger => passenger.destination));
      if (lowest >= currentFloor && building.floors[currentFloor].callDown() == false) {
        this.ascending = true;
      }
    }
  }
  disembarkPassengers(currentFloor) {
    return new Promise(async resolve => {
      while (true) {
        await delay(1000);
        let matchingIndex = this.passengers.findIndex(passenger => passenger.destination == currentFloor);
        if (matchingIndex == -1) {
          resolve();
          break;
        }
        let disembarkingPassenger = this.passengers.splice(matchingIndex, 1)[0];
        this.renderInPlace();
        // push disembarkingPassenger to building.floors[currentFloor].disembarkingPassengers
        // building.floors[currentFloor].renderInPlace();
      }
    });
  }
  embarkPassengers(currentFloor) {
    return new Promise(async resolve => {
      let matchingIndex;
      while (true) {
        await delay(1000);
        if (this.ascending) {
          matchingIndex = building.floors[currentFloor].waitingPassengers.findIndex(passenger => passenger.destination > currentFloor);
        } else {
          matchingIndex = building.floors[currentFloor].waitingPassengers.findIndex(passenger => passenger.destination < currentFloor);
        }
        if (matchingIndex == -1) {
          resolve();
          break;
        }
        let embarkingPassenger = building.floors[currentFloor].waitingPassengers.splice(matchingIndex, 1)[0];
        this.passengers.push(embarkingPassenger);
        this.renderInPlace();
        building.floors[currentFloor].renderInPlace();
      }
    });
  }
  setDestination(currentFloor) {
    this.callQueue = this.callQueue.filter(call => call.origin != currentFloor || call.ascending != this.ascending);
    if (this.ascending) {
      // TODO: fix - these Math functions will return +/- infinity once there are no passengers remaining
      // TODO: fix - also if the first passenger added wants to descend, these also will return infinity
      this.destination = Math.min(...this.callQueue.filter(call => call.origin > currentFloor && call.ascending == this.ascending).map(call => call.origin), ...this.passengers.filter(passenger => passenger.destination > currentFloor).map(passenger => passenger.destination));
    } else {
      this.destination = Math.max(...this.callQueue.filter(call => call.origin < currentFloor && call.ascending == this.ascending).map(call => call.origin), ...this.passengers.filter(passenger => passenger.destination < currentFloor).map(passenger => passenger.destination));
    }
    console.log(this);
  }
  render() {
    return `<div class="lift" style="transform:translateY(${this.currentLocation}px)">
              <ul class="lift-passengers">
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
}

class AddPassenger {
  constructor(destination) {
    this.destination = +destination;
  }
  render() {
    return `<li class="passenger" data-destination="${this.destination}" draggable="true" ondragstart="dragstart_handler(event)">
              <img src="img/passenger.svg" onload="SVGInject(this)" />
            </li>`;
  }
}

function numberToOrdinal(inputNumber) {
  switch (inputNumber) {
    case 0:
      return 'Ground';
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

function floorNumberToOffset(floorNumber) {
  return floorNumber * -109 + 1;
}

function getTranslateY(myElement) {
  let style = window.getComputedStyle(myElement);
  let matrix = new DOMMatrix(style.transform);
  return matrix.m42;
}

function dragstart_handler(event) {
  event.dataTransfer.setData('text/plain', event.target.dataset.destination);
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
  const floorNumber = event.target.closest('.floor').dataset.number;
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
  let destinationLocation = floorNumberToOffset(destinationFloor);
  let newLocation;
  if (lift.ascending) {
    newLocation = currentLocation - 1;
  } else {
    newLocation = currentLocation + 1;
  }

  lift.setLocation(newLocation);

  if ((lift.ascending && newLocation < destinationLocation) || (!lift.ascending && newLocation > destinationLocation)) {
    start = undefined;
    lift.setLocation(destinationLocation);
    await lift.exchangePassengers(destinationFloor);
    if (lift.passengers.length > 0 || lift.callQueue.length > 0) {
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
  .map(floor => new AddPassenger(floor.floorNumber))
  .map(addpassenger => addpassenger.render())
  .join('');
