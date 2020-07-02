// TODO: add uuid

class Passenger {
  constructor(destination) {
    // this.id = uuid();
    this.destination = destination;
  }
}

class Building {
  constructor() {
    this.floors = [new Floor(0), new Floor(1), new Floor(2)];
    this.element = document.querySelector('.building');
  }
  // addFloor() {
  //   let newFloorNumber = this.floors.length;
  //   this.element.insertAdjacentHTML('afterbegin', '<div class="floor" data-number="' + newFloorNumber + '"><p>New floor</p></div>');
  //   this.floors.push(new Floor(newFloorNumber));
  // }
  // removeFloor() {
  //   this.floors.pop();
  // }
  // addLift() {}
  // removeLift() {}
}

class Floor {
  constructor(floorNumber) {
    this.waitingPassengers = [];
    this.element = document.querySelector('.floor[data-number="' + floorNumber + '"]');
    this.disembarkArea = this.element.querySelector('.disembark-area');
    this.waitingArea = this.element.querySelector('.waiting-area');
  }
  addPassenger(destination = 0) {
    this.waitingPassengers.push(new Passenger(destination));
    this.waitingArea.insertAdjacentHTML('beforeend', '<div class="passenger" data-destination="' + destination + '"><img src="img/passenger.svg" /></div>');
  }
  boardPassenger(id) {
    this.waitingPassengers.filter(waitingPassenger => waitingPassenger.id != id);
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
  disembarkPassengers() {
    this.passengers.filter(passenger => passenger.destination != this.currentFloor);
  }
  embarkPassengers(waitingPassengers) {
    waitingPassengers.forEach(passenger => {
      if ((passenger.destination > this.currentFloor && this.ascending()) || (passenger.destination < this.currentFloor && this.descending())) {
        this.passengers.push(passenger);
        building.floors[this.currentFloor].boardPassenger(passenger.id);
      }
    });
    this.callQueue = this.callQueue.filter(floor => floor != this.currentFloor);
    this.setDestination();
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

const building = new Building();
const lift = new Lift();
