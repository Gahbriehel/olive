export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const MONTH_ABBR = MONTH_NAMES.map((name) => name.slice(0, 3));

/** 1-based month number to its full name. */
export const monthName = (month: number) => MONTH_NAMES[month - 1];
