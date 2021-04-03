function* idGeneratorFunction() {
  let index = 0;
  while (true) {
    yield index++;
  }
}

const idGenerator = idGeneratorFunction();

function newId() {
  return idGenerator.next().value;
}

export default newId;
