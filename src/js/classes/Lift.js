import PassengerContainer from './PassengerContainer';
import LiftCompartment from './LiftCompartment';
// import floorNumberToLocation

export default class Lift extends PassengerContainer {
  constructor() {
    super();
    this.compartment = new LiftCompartment();
    // this.maxSpeed = 20;
    // this.acceleration = 1;
    // this.currentSpeed = 0; // pixels per animation tick
    // this.capacity = 9;
  }
  get element() {
    return document.querySelector('.lift');
  }
  setLocation(newLocation) {
    this.currentLocation = newLocation;
    this.element.style.transform = `translateY(${newLocation}px)`;
  }
  move = async timestamp => {
    if (start === undefined) start = timestamp;
    const elapsed = timestamp - start;

    const destinationLocation = floorNumberToLocation(this.destination);
    let newLocation;
    if (this.ascending) {
      newLocation = this.currentLocation - 1;
    } else {
      newLocation = this.currentLocation + 1;
    }

    this.setLocation(newLocation);

    if (this.ascending == newLocation < destinationLocation) {
      start = undefined;
      this.setLocation(destinationLocation);
      await this.exchangePassengers(this.destination);
      if (this.destination != null) {
        window.requestAnimationFrame(this.move);
      }
    } else {
      window.requestAnimationFrame(this.move);
    }
  };
  render() {
    return `<div class="lift" style="transform:translateY(${this.currentLocation}px)">
              ${this.compartment.render()}
            </div>`;
  }
}
