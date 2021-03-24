function floorNumberToLocation(floorNumber) {
  return floorNumber * 108;
}

function locationToFloorNumber(liftLocation, liftAscending) {
  if (liftAscending) {
    return Math.floor(liftLocation / 108);
  } else {
    return Math.ceil(liftLocation / 108);
  }
}

export { floorNumberToLocation, locationToFloorNumber };
