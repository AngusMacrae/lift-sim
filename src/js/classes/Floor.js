import WaitingArea from './WaitingArea';
import DisembarkArea from './DisembarkArea';
import numberToOrdinal from '../functions/numberToOrdinal';

export default class Floor {
  constructor(floorNum) {
    this.floorNumber = +floorNum;
    this.waitingArea = new WaitingArea();
    this.disembarkArea = new DisembarkArea();
  }
  get element() {
    return document.querySelector(`.floor[data-floor="${this.floorNumber}"]`);
  }
  get calling() {
    return this.waitingArea.getCallingStatus(this.floorNumber);
  }
  render() {
    return `<div class="floor" data-floor="${this.floorNumber}">
              <span class="floor-label">${numberToOrdinal(this.floorNumber)} floor</span>
              ${this.disembarkArea.render()}
              ${this.waitingArea.render()}
            </div>`;
  }
}
