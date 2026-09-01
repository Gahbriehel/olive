export function padNumberWithZeros(number = 0, length = 2): string {
  return number.toString().padStart(length, "0");
}
