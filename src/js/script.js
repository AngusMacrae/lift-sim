import Building from './classes/Building.js';
import AddPassengerDraggable from './classes/AddPassengerDraggable.js';
import {
  dragstart_handler,
  dragover_handler,
  drop_handler
} from './functions/dragHandlers.js';

const building = new Building(5);

let start;

document.querySelector('#building-placeholder').outerHTML = building.render();
document.querySelector('#commands').innerHTML = building.floors
  .map(floor => new AddPassengerDraggable(floor.floorNumber))
  .map(draggable => draggable.render())
  .join('');

document.querySelector('#commands').querySelectorAll('.passenger').forEach(item => {
  item.addEventListener("dragstart", event => dragstart_handler(event));
});

document.querySelectorAll('.waiting-area').forEach(item => {
  item.addEventListener("dragover", event => dragover_handler(event));
  item.addEventListener("drop", event => drop_handler(event, building));
});

export default building;

