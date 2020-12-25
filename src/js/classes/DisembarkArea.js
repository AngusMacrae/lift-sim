import PassengerContainer from './PassengerContainer.js';

export default class DisembarkArea extends PassengerContainer {
  constructor() {
    super();
  }
  render() {
    return `<div data-id="${this.id}" class="disembark-area-container">
              <ul class="disembark-area"></ul>
            </div>`;
  }
}
