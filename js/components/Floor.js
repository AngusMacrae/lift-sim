import DynamicElement from './abstract/DynamicElement.js';
import WaitingArea from './WaitingArea.js';
import DisembarkArea from './DisembarkArea.js';
import floorNumberToLabel from '../functions/floorNumberToLabel.js';

export default class Floor extends DynamicElement {
  constructor(floorNum) {
    super();
    this.floorNumber = +floorNum;
    this.waitingArea = new WaitingArea(floorNum);
    this.disembarkArea = new DisembarkArea(floorNum);
  }
  get calling() {
    return {
      ascending: this.waitingArea.callingUp,
      descending: this.waitingArea.callingDown,
    };
  }
  render() {
    return `<div data-id="${this.id}" class="floor" data-floor="${this.floorNumber}">
              <span class="floor-label">${floorNumberToLabel(this.floorNumber)}</span>
              ${this.disembarkArea.render()}
              ${this.waitingArea.render()}
            </div>`;
  }
}
