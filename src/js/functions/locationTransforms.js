const FLOOR_HEIGHT = 108; // px

function floorNumberToLocation(floorNumber) {
  return floorNumber * FLOOR_HEIGHT;
}

function locationToFloorNumber(liftLocation, liftAscending) {
  return liftAscending ? Math.floor(liftLocation / FLOOR_HEIGHT) : Math.ceil(liftLocation / FLOOR_HEIGHT);
}

export { floorNumberToLocation, locationToFloorNumber };
