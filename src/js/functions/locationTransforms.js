function floorNumberToLocation(floorNumber) {
  return floorNumber * 108 + 1;
}

function locationToFloorNumber(location, ascending) {
  if (ascending) {
    return Math.ceil(location / 108) - 1;
  } else {
    return Math.floor(location / 108);
  }
}

export { floorNumberToLocation, locationToFloorNumber };
