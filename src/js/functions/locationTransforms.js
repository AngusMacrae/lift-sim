function floorNumberToLocation(floorNumber) {
  return floorNumber * -109 + 1;
}

function locationToFloorNumber(location, ascending) {
  if (ascending) {
    return Math.ceil(location / -109);
  } else {
    return Math.floor(location / -109);
  }
}

export { floorNumberToLocation, locationToFloorNumber };
