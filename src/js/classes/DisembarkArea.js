import PassengerContainer from './PassengerContainer';

export default class DisembarkArea extends PassengerContainer {
  constructor() {
    super();
  }
  get element() {}
  render() {
    return `<div class="disembark-area-container">
              <ul class="disembark-area"></ul>
            </div>`;
  }
}
