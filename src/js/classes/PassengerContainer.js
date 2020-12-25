import DynamicElement from './DynamicElement.js';
import delay from '../functions/delay.js';

export default class PassengerContainer extends DynamicElement {
  constructor() {
    super();
    this.passengers = [];
  }
  async takePassenger(callback) {
    // callback: passenger => passenger.destination > this.floorNumber == ascending
    const index = this.passengers.findIndex(callback);
    if (index > -1) {
      await delay(1000);
      const passenger = this.passengers.splice(index, 1)[0];
      this.renderInPlace();
      return passenger;
    } else {
      return null;
    }
  }
  givePassenger(passenger) {
    this.passengers.push(passenger);
    this.renderInPlace();
  }
}
