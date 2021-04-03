import CustomComponent from './abstract/CustomComponent.js';
import PassengerDraggable from './PassengerDraggable.js';

export default class CommandPalette extends CustomComponent {
  constructor(numberOfFloors) {
    super();
    this.draggables = [];
    for (let i = 0; i < numberOfFloors; i++) {
      this.draggables.push(new PassengerDraggable(i));
    }
  }
  render() {
    return `<ul data-id="${this.id}" id="commands" class="command-palette">
              ${this.draggables.map(draggable => draggable.render()).join('')}
            </ul>`;
  }
}
