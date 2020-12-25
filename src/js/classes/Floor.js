import DynamicElement from './DynamicElement.js';
import WaitingArea from './WaitingArea.js';
import DisembarkArea from './DisembarkArea.js';
import numberToOrdinal from '../functions/numberToOrdinal.js';

export default class Floor extends DynamicElement {
  constructor(floorNum) {
    super();
    this.floorNumber = +floorNum;
    this.waitingArea = new WaitingArea();
    this.disembarkArea = new DisembarkArea();
  }
  get calling() {
    return this.waitingArea.getCallingStatus(this.floorNumber);
  }
  render() {
    return `<div data-id="${this.id}" class="floor" data-floor="${this.floorNumber}">
              <span class="floor-label">${numberToOrdinal(this.floorNumber)} floor</span>
              ${this.disembarkArea.render()}
              ${this.waitingArea.render()}
            </div>`;
  }
}
