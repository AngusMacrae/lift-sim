import CustomComponent from './abstract/CustomComponent.js';
import PassengerDraggable from './PassengerDraggable.js';

export default class PassengerDraggablesList extends CustomComponent {
  constructor(numberOfFloors) {
    super();
    this.draggables = [];
    for (let i = 0; i < numberOfFloors; i++) {
      this.draggables.push(new PassengerDraggable(i));
    }
  }
  render() {
    return `<ul data-id="${this.id}" class="draggables-list">
              ${this.draggables.map(draggable => draggable.render()).join('')}
            </ul>`;
  }
}
