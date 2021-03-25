export default function stoppingDistance(currentSpeed, maxDeceleration) {
  return currentSpeed ** 2 / (2 * maxDeceleration);
}
