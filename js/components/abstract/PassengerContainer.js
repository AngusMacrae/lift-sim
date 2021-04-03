import DynamicElement from './DynamicElement.js';
import delay from '../../functions/delay.js';

export default class PassengerContainer extends DynamicElement {
  constructor() {
    super();
    this.passengers = [];
  }
  async removePassenger(criteria) {
    const index = this.passengers.findIndex(criteria);

    if (index === -1) return null;

    await delay(1000);
    const passenger = this.passengers.splice(index, 1)[0];
    this.renderInPlace();
    return passenger;
  }
  addPassenger(passenger) {
    this.passengers.push(passenger);
    this.renderInPlace();
  }
}
