import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

interface Props {
  date: string;
  showTime?: boolean;
  utc?: boolean;
}

export function formatDate({
  date,
  showTime = true,
  utc = false,
}: Props): string {
  if (!date) return "";
  if (utc) {
    return showTime
      ? dayjs(date).utc().format("MMM DD, YYYY hh:mmA")
      : dayjs(date).utc().format("MMM DD, YYYY");
  }

  return showTime
    ? dayjs(date).format("MMM DD, YYYY hh:mmA")
    : dayjs(date).format("MMM DD, YYYY");
}

export function formatDateToInputType(date: string): string {
  return dayjs(date).utc().format("YYYY-MM-DD");
}
