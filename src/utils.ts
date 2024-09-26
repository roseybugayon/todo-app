import { format, isToday, isTomorrow } from "date-fns";

export function getFormattedDate(dateStr: string | null | undefined): string {
  if (dateStr) {
    const dateParts = dateStr.split("-");
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    const date = new Date(year, month, day);

    if (isToday(date)) {
      return "Today";
    } else if (isTomorrow(date)) {
      return "Tomorrow";
    } else {
      return format(date, "MMM dd, yyyy");
    }
  } else {
    return "";
  }
}
