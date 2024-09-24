import { format, isToday, isTomorrow } from "date-fns";

export function getFormattedDate(dateStr: string | null | undefined): string {
  if (dateStr) {
    const date = new Date(dateStr);

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
