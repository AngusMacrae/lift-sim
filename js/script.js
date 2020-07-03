// TODO: add uuid

class Passenger {
  constructor(destination) {
    // this.id = uuid();
    this.destination = destination;
  }
  render() {
    return `<div class="passenger" data-destination="${this.destination}">
              <img src="img/passenger.svg" />
            </div>'`;
  }
}

class Building {
  constructor(numberOfFloors = 3) {
    this.floors = [];
    for (let i = 0; i < numberOfFloors; i++) {
      this.floors.push(new Floor(i));
    }
  }
  render() {
    return `<div class="building">
              <div class="lift-shaft">
                <div class="lift"></div>
              </div>
              ${this.floors.map(floor => floor.render()).join('')}
            </div>`;
  }
  // addFloor() {}
  // removeFloor() {}
  // addLift() {}
  // removeLift() {}
}

class Floor {
  constructor(floorNumber = 0) {
    this.waitingPassengers = [];
    this.floorNumber = floorNumber;
  }
  addPassenger(destination = 0) {
    this.waitingPassengers.push(new Passenger(destination));
  }
  boardPassenger(id) {
    this.waitingPassengers = this.waitingPassengers.filter(waitingPassenger => waitingPassenger.id != id);
  }
  render() {
    return `<div class="floor" data-number="${this.floorNumber}">
              <span class="floor-label">${numberToOrdinal(this.floorNumber)} floor</span>
              <div class="disembark-area-container">
                <ul class="disembark-area"></ul>
              </div>
              <div class="waiting-area-container">
                <ul class="waiting-area" ondrop="drop_handler(event)" ondragover="dragover_handler(event)">
                  ${this.waitingPassengers.map(passenger => passenger.render()).join('')}
                </ul>
              </div>
            </div>`;
  }
}

class Lift {
  constructor(startFloor = 0) {
    this.passengers = [];
    this.callQueue = [];
    this.destination = null;
    this.currentFloor = startFloor;
  }
  ascending() {
    return this.destination > this.currentFloor;
  }
  descending() {
    return this.destination < this.currentFloor;
  }
  call(floor) {
    this.callQueue.unshift(floor);
    this.setDestination();
  }
  setDestination() {
    // set destination based on current floor, destination, callQueue and passenger destinations
  }
  exchangePassengers() {
    this.disembarkPassengers();
    this.embarkPassengers();
    this.callQueue = this.callQueue.filter(floor => floor != this.currentFloor);
    this.setDestination();
    this.updateDOM();
  }
  disembarkPassengers() {
    this.passengers.filter(passenger => passenger.destination != this.currentFloor);
  }
  embarkPassengers() {
    building.floors[this.currentFloor].waitingPassengers.forEach(passenger => {
      if ((passenger.destination > this.currentFloor && this.ascending()) || (passenger.destination < this.currentFloor && this.descending())) {
        this.passengers.push(passenger);
        building.floors[this.currentFloor].boardPassenger(passenger.id);
      }
    });
  }
  updateDOM() {
    document.querySelector('.lift').outerHTML = this.render();
    document.querySelector('.floor[data-number="' + this.currentFloor + '"]').outerHTML = building.floors[this.currentFloor].render();
  }
  render() {
    return `<div class="lift">
              ${this.passengers.map(passenger => passenger.render()).join('')}
            </div>`;
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
    const waitingPassengerHTML = '<li class="passenger" data-destination="' + passengerDestination + '"><img src="img/passenger.svg" onload="SVGInject(this)" /></li>';
    waitingArea.insertAdjacentHTML('beforeend', waitingPassengerHTML);
  }
}

let addPassengerDraggables = document.querySelectorAll('.command-palette .passenger');
addPassengerDraggables.forEach.addEventListener('dragstart', dragstart_handler);

const building = new Building(4);
const lift = new Lift();
