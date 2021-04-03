import CustomComponent from './abstract/CustomComponent.js';

export default class Passenger extends CustomComponent {
  constructor(destination) {
    super();
    this.destination = +destination;
  }
  render() {
    return `<li data-id="${this.id}" class="passenger" data-floor="${this.destination}">
              <img src="img/passenger.svg" onload="SVGInject(this)" />
            </li>`;
  }
}
