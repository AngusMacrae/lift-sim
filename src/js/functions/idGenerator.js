function* idGenerator() {
  let index = 0;
  while (true) {
    yield index++;
  }
}

const componentId = idGenerator();

export default componentId;
