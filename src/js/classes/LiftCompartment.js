import PassengerContainer from './PassengerContainer.js';

export default class LiftCompartment extends PassengerContainer {
  constructor() {
    super();
  }
  render() {
    return `<ul class="lift-passengers-container">
              ${this.passengers.map(passenger => passenger.render()).join('')}
            </ul>`;
  }
}
