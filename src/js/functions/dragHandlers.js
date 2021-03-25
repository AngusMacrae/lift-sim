import building from '../main.js';

function dragstartHandler(event) {
  event.dataTransfer.setData('text/plain', event.target.dataset.floor);
  event.dataTransfer.dropEffect = 'move';
}

function dragoverHandler(event) {
  event.preventDefault();
}

function dragenterHandler(event) {}

function dragleaveHandler(event) {}

function dropHandler(event) {
  const passengerDestination = event.dataTransfer.getData('text/plain');
  const floorNumber = event.target.closest('.floor').dataset.floor;
  if (passengerDestination != floorNumber) {
    building.floors[floorNumber].waitingArea.newPassenger(passengerDestination);
    event.preventDefault();
  }
}

export { dragstartHandler, dragenterHandler, dragoverHandler, dragleaveHandler, dropHandler };
