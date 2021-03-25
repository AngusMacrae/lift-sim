export default async function transferPassengers(fromContainer, toContainer, criteria) {
  while (true) {
    const transferringPassenger = await fromContainer.removePassenger(criteria);
    if (!transferringPassenger) return;
    toContainer.addPassenger(transferringPassenger);
  }
}
