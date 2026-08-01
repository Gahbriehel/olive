export function truncateString(string = "", number: number = 12): string {
  if (string?.length > number) {
    return string.slice(0, number) + "...";
  } else {
    return string;
  }
}
