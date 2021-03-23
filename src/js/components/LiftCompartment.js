import PassengerContainer from './PassengerContainer.js';

export default class LiftCompartment extends PassengerContainer {
  constructor() {
    super();
  }
  render() {
    return `<ul data-id="${this.id}" class="lift-compartment">
              ${this.passengers.map(passenger => passenger.render()).join('')}
            </ul>`;
  }
}
