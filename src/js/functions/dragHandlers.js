function dragstart_handler(event) {
  event.dataTransfer.setData('text/plain', event.target.dataset.floor);
  event.dataTransfer.dropEffect = 'move';
}

function dragover_handler(event) {
  event.preventDefault();
  // show invalid drop effect if passenger destination is same as dragged floor
  // also add class to floor to show visually
  event.dataTransfer.dropEffect = 'move';
}

function drop_handler(event) {
  event.preventDefault();
  const passengerDestination = event.dataTransfer.getData('text/plain');
  const floorNumber = event.target.closest('.floor').dataset.floor;
  if (passengerDestination != floorNumber) {
    building.floors[floorNumber].waitingArea.addPassenger(passengerDestination);
    building.floors[floorNumber].waitingArea.renderInPlace();
  }
}
