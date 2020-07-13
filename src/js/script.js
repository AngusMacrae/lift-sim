// import everything here

const componentRegistry = [];

const building = new Building(5);

let start;

document.querySelector('#building-placeholder').outerHTML = building.render();
document.querySelector('#commands').innerHTML = building.floors
  .map(floor => new AddPassengerDraggable(floor.floorNumber))
  .map(draggable => draggable.render())
  .join('');
