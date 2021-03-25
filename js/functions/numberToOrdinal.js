export default function numberToOrdinal(inputNumber) {
  switch (inputNumber) {
    case 0:
      return 'Gr.';
    case 1:
      return '1st';
    case 2:
      return '2nd';
    case 3:
      return '3rd';
    default:
      return `${inputNumber}th`;
  }
}
