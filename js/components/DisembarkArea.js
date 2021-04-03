import PassengerContainer from './abstract/PassengerContainer.js';

export default class DisembarkArea extends PassengerContainer {
  constructor() {
    super();
  }
  render() {
    return `<div data-id="${this.id}" class="disembark-area-container">
              <ul class="disembark-area">
                ${this.passengers.map(passenger => passenger.render()).join('')}
              </ul>
            </div>`;
  }
}
