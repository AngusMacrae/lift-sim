function floorNumberToLocation(floorNumber) {
  return floorNumber * 108;
}

function locationToFloorNumber(location, ascending) {
  if (ascending) {
    return Math.floor(location / 108);
  } else {
    return Math.ceil(location / 108);
  }
}

export { floorNumberToLocation, locationToFloorNumber };
