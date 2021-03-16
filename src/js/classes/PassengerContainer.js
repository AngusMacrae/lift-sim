import DynamicElement from './DynamicElement.js';
import delay from '../functions/delay.js';

export default class PassengerContainer extends DynamicElement {
  constructor() {
    super();
    this.passengers = [];
  }
  async removePassenger(callback) {
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
  addPassenger(passenger) {
    this.passengers.push(passenger);
    this.renderInPlace();
  }
}
