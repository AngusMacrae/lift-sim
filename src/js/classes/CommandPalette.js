import DynamicElement from './DynamicElement.js';
import AddPassengerDraggable from './AddPassengerDraggable.js';

export default class CommandPalette extends DynamicElement {
  constructor(numberOfFloors) {
    super();
    this.draggables = [];
    for (let i = 0; i < numberOfFloors; i++) {
      this.draggables.push(new AddPassengerDraggable(i));
    }
  }
  render() {
    return `<ul data-id="${this.id}" id="commands" class="command-palette">
              ${this.draggables.map(draggable => draggable.render()).join('')}
            </ul>`;
  }
}
