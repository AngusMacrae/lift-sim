import Building from './components/Building.js';
import PassengerDraggablesList from './components/PassengerDraggablesList.js';

const NUM_FLOORS = 6;

const building = new Building(NUM_FLOORS);
const passengerDraggablesList = new PassengerDraggablesList(NUM_FLOORS);

document.querySelector('#building-placeholder').outerHTML = building.render();
document.querySelector('#draggables-list-placeholder').outerHTML = passengerDraggablesList.render();

building.floors.forEach(floor => floor.waitingArea.initialiseEventListeners());
passengerDraggablesList.draggables.forEach(draggable => draggable.initialiseEventListeners());

export default building;
