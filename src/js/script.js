import Building from './classes/Building.js';
import CommandPalette from './classes/CommandPalette.js';

const NUM_FLOORS = 5;

const building = new Building(NUM_FLOORS);
const commandPalette = new CommandPalette(NUM_FLOORS);

document.querySelector('#building-placeholder').outerHTML = building.render();
document.querySelector('#commands-placeholder').outerHTML = commandPalette.render();

building.floors.forEach(floor => floor.waitingArea.initialiseEventListeners());
commandPalette.draggables.forEach(draggable => draggable.initialiseEventListeners());

export default building;
