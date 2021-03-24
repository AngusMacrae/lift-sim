export default class Passenger {
  constructor(destination) {
    this.destination = +destination;
  }
  render() {
    return `<li class="passenger" data-floor="${this.destination}">
              <img src="img/passenger.svg" onload="SVGInject(this)" />
            </li>`;
  }
}