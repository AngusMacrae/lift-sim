// TODO: add uuid

class Passenger {
  constructor(destination) {
    // this.id = uuid();
    this.destination = destination;
  }
}

class Building {
  constructor() {
    this.floors = [new Floor(), new Floor(), new Floor()];
  }
  addFloor() {
    this.floors.push(new Floor());
  }
  removeFloor() {
    this.floors.pop();
  }
  addLift() {}
  removeLift() {}
}

class Floor {
  constructor() {
    this.waitingPassengers = [];
  }
  addPassenger(destination = 0) {
    this.waitingPassengers.push(new Passenger(destination));
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

const building = new Building();
const lift = new Lift();
