// TODO: add uuid

class Passenger {
  constructor(destination) {
    // this.id = uuid();
    this.destination = destination;
  }
  render() {
    return `<li class="passenger" data-destination="${this.destination}">
              <img src="img/passenger.svg" onload="SVGInject(this)" />
            </li>`;
  }
}

class Building {
  constructor(numberOfFloors = 3) {
    this.floors = [];
    for (let i = numberOfFloors - 1; i >= 0; i--) {
      this.floors.push(new Floor(i));
    }
  }
  element() {
    return document.querySelector('.building');
  }
  render() {
    return `<div class="building">
              ${this.floors.map(floor => floor.render()).join('')}
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
    this.floorNumber = floorNumber;
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
    lift.call(this.floorNumber);
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
  constructor(startFloor = 0) {
    this.passengers = [];
    this.callQueue = [];
    this.destination = null;
    // this.currentFloor = startFloor;
    // this.capacity = 9;
    this.maxSpeed = 20;
    this.acceleration = 1;
    this.currentSpeed = 0; // pixels per animation tick
    this.ascending = true;
  }
  element() {
    return document.querySelector('.lift');
  }
  destinationQueue() {
    return [...this.callQueue, ...this.passengers.map(passenger => passenger.destination)];
  }
  call(newCall) {
    let isUnique = this.callQueue.includes(newCall);
    if (isUnique) {
      this.callQueue.push(newCall);
    }
    // console.log(this);
    // window.requestAnimationFrame(moveLift);
  }
  async exchangePassengers(currentFloor) {
    this.setDirection(currentFloor);
    await this.disembarkPassengers(currentFloor);
    await this.embarkPassengers(currentFloor);
    this.setDestination(currentFloor);
    // window.requestAnimationFrame(moveLift);
    // return new Promise?
  }
  setDirection(currentFloor) {
    if (this.ascending) {
      let highest = Math.max(this.destinationQueue());
      if (highest <= currentFloor && building[currentFloor].callUp() == false) {
        this.ascending = false;
      }
    } else {
      let lowest = Math.min(this.destinationQueue());
      if (lowest >= currentFloor && building[currentFloor].callDown() == false) {
        this.ascending = true;
      }
    }
  }
  async disembarkPassengers(currentFloor) {
    return new Promise(resolve => {
      while (true) {
        await delay(1000);
        let matchingIndex = this.passengers.findIndex(passenger => passenger.destination == currentFloor);
        if (matchingIndex == -1) resolve();
        let disembarkingPassenger = this.passengers.splice(matchingIndex, 1);
        this.renderInPlace();
        // push disembarkingPassenger to disembark area
        // rerender disembark area
  }
    });
  }
  async embarkPassengers(currentFloor) {
    return new Promise(resolve => {
      let matchingIndex;
      while (true) {
        await delay(1000);
        if (this.ascending) {
          matchingIndex = building.floors[currentFloor].findIndex(passenger => passenger.destination > currentFloor);
        } else {
          matchingIndex = building.floors[currentFloor].findIndex(passenger => passenger.destination < currentFloor);
  }
        if (matchingIndex == -1) {
          resolve();
          break;
  }
        let embarkingPassenger = building.floors[currentFloor].splice(matchingIndex, 1);
        this.passengers.push(embarkingPassenger);
        this.renderInPlace();
        building.floors[currentFloor].renderInPlace();
      }
    });
  }
  setDestination(currentFloor) {
    if (this.ascending) {
      this.destination = Math.min(...this.destinationQueue().filter(floorNumber => floorNumber > currentFloor));
    } else {
      this.destination = Math.max(...this.destinationQueue().filter(floorNumber => floorNumber < currentFloor));
    }
  }
  render() {
    return `<div class="lift">
              <ul class="lift-passengers">
              ${this.passengers.map(passenger => passenger.render()).join('')}
              </ul>
            </div>`;
  }
  renderInPlace() {
    this.element().outerHTML = this.render();
  }
}

class AddPassenger {
  constructor(destination) {
    this.destination = destination;
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
  event.dataTransfer.dropEffect = 'move';
}

function drop_handler(event) {
  event.preventDefault();
  const passengerDestination = event.dataTransfer.getData('text/plain');
  const floorNumber = event.target.closest('.floor').dataset.number;
  if (passengerDestination != floorNumber) {
    const waitingArea = event.target.closest('.waiting-area');
    building.floors[floorNumber].waitingPassengers.push(new Passenger(passengerDestination));
    event.target.closest('.floor').outerHTML = building.floors[floorNumber].render();
  }
}

const lift = new Lift();
const building = new Building(4);

document.querySelector('#building-placeholder').outerHTML = building.render();
document.querySelector('#commands').innerHTML = building.floors
  .map(floor => new AddPassenger(floor.floorNumber))
  .map(addpassenger => addpassenger.render())
  .join('');

let addPassengerDraggables = document.querySelectorAll('.command-palette .passenger');
addPassengerDraggables.forEach.addEventListener('dragstart', dragstart_handler);
