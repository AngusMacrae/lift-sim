import passengerSVG from '../../img/passenger.svg';

export default class Passenger {
  constructor(destination) {
    this.destination = +destination;
  }
  render() {
    return `<li class="passenger" data-floor="${this.destination}">
              <img src="${passengerSVG}" onload="SVGInject(this)" />
            </li>`;
  }
}
