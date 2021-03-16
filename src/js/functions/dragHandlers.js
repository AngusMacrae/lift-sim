import building from '../script.js';

function dragstart_handler(event) {
  event.dataTransfer.setData('text/plain', event.target.dataset.floor);
  event.dataTransfer.dropEffect = 'move';
  // console.log('drag start, destination: ' + event.target.dataset.floor);
}

function dragover_handler(event) {
  event.preventDefault();
  // show invalid drop effect if passenger destination is same as dragged floor
  // also add class to floor to show visually
  event.dataTransfer.dropEffect = 'move';
}

function drop_handler(event) {
  event.preventDefault();
  // console.log('dropped');
  // console.log(event.target.closest('.waiting-area-container').dataset.id);
  // console.log(building);
  const passengerDestination = event.dataTransfer.getData('text/plain');
  const floorNumber = event.target.closest('.floor').dataset.floor;
  if (passengerDestination != floorNumber) {
    building.floors[floorNumber].waitingArea.newPassenger(passengerDestination);
    building.floors[floorNumber].waitingArea.renderInPlace();
  }
}

export { dragstart_handler, dragover_handler, drop_handler };
