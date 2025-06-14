export const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export function mapToShortDay(day: string): string {
  const dayMap: { [key: string]: string } = {
    Sunday: "U",
    Monday: "M",
    Tuesday: "T",
    Wednesday: "W",
    Thursday: "R",
    Friday: "F",
    Saturday: "S",
  };
  return dayMap[day] || "";
}
export const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];
export const shortMonthsOfYear = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
export function FormatYearMonthDayTimeNoSeconds(
  value: Date | string | undefined
) {
  if (!value) return "";
  const date = new Date(value);
  return FormatYearMonthDay(date) + " " + FormatTimeNoSeconds(date);
}
export function FormatMonthDayYearTimeNoSeconds(
  value: Date | string | undefined
) {
  if (!value) return "";
  const date = new Date(value);
  return FormatMonthDayYear(date) + " " + FormatTimeNoSeconds(date);
}
export function FormatMonthDayAtTimeNoSeconds(
  value: Date | string | undefined
) {
  if (!value) return "";
  const date = new Date(value);
  return FormatMonthDayAt(date) + " " + FormatTimeNoSeconds(date);
}
export function FormatDatetimeLocalInput(value: Date | string | undefined) {
  if (!value) return "";
  const date = new Date(value);
  return FormatYearMonthDay(date, "-") + "T" + FormatHourMinute(date);
}
export function FormatTimeNoSeconds(value: Date | string | undefined) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}
export function FormatHourMinute(value: Date | string | undefined) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
}
export function FormatDayWeek(value: Date | string | undefined) {
  if (!value) return "";
  const date = new Date(value);
  const formattedDate = `${daysOfWeek[date.getDay()]}, ${
    shortMonthsOfYear[date.getMonth()]
  } ${date.getDate()}`;
  return formattedDate;
}
export function FormatYearMonthDay(
  value: Date | string | undefined,
  delimiter: string = "/"
) {
  if (!value) return "";
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year + delimiter + month + delimiter + day}`;
}
export function FormatMonthDayYear(
  value: Date | string | undefined,
  delimiter: string = "/"
) {
  if (!value) return "";
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month + delimiter + day + delimiter + year}`;
}
export function FormatMonthDay(
  value: Date | string | undefined,
  delimiter: string = "/"
) {
  if (!value) return "";
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month + delimiter + day}`;
}
export function FormatMonthDayShortYear(
  value: Date | string | undefined,
  delimiter: string = "/"
): string {
  if (!value) return "";
  const date = new Date(value);
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}${delimiter}${day}${delimiter}${year}`;
}
export function FormatMonthDayAt(value: Date | string | undefined) {
  if (!value) return "";
  const date = new Date(value);
  const month = getAbbreviatedMonth(date);
  const day = String(date.getDate());
  return `${month} ${day} @`;
}
export function FormatMonthAbbrevDay(value: Date | string | undefined) {
  if (!value) return "";
  const date = new Date(value);
  const month = getAbbreviatedMonth(date);
  const day = String(date.getDate());
  return `${month} ${day}`;
}
function getAbbreviatedMonth(date: Date) {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return monthNames[date.getMonth()];
}
export function FormatLongMonthDayTime(value: Date | string | undefined) {
  if (!value) return "";
  const date = new Date(value);
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
  return date.toLocaleString("en-US", options);
}
export function FormatLongMonthDay(
  value: Date | string | undefined,
  monthFormat: "long" | "numeric" | "2-digit" | "short" | "narrow" = "long",
  dayFormat: "numeric" | "2-digit" = "numeric"
) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleString("en-US", {
    month: monthFormat,
    day: dayFormat,
  });
}
export function FormatDynamicDate(value: Date | string | undefined): string {
  if (value === undefined) {
    return "";
  }
  const dateValue = new Date(value);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  dateValue.setHours(0, 0, 0, 0);
  const diffInDays = Math.floor(
    (now.getTime() - dateValue.getTime()) / (1000 * 3600 * 24)
  );
  if (diffInDays === 0) {
    return FormatTimeNoSeconds(new Date(value));
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < now.getDay()) {
    return dateValue.toLocaleDateString(undefined, { weekday: "long" });
  } else {
    return dateValue.toLocaleDateString(undefined, {
      weekday: "short",
      month: "numeric",
      day: "numeric",
    });
  }
}

export function FormatFutureDynamicDate(
  value: Date | string | undefined
): string {
  if (value === undefined) {
    return "";
  }
  const dateValue = new Date(value);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  dateValue.setHours(0, 0, 0, 0);
  const today = now;
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const diffInDays =
    (dateValue.getTime() - today.getTime()) / (1000 * 3600 * 24);
  if (diffInDays === 0) {
    return "Today " + FormatTimeNoSeconds(new Date(value));
  } else if (diffInDays === 1) {
    return (
      "Tomorrow, " +
      new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      })
    );
  } else {
    return new Date(value).toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  }
}

export function FormatDynamicDateNoTime(
  value: Date | string | undefined
): string {
  if (value === undefined) {
    return "";
  }
  const dateValue = new Date(value);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  dateValue.setHours(0, 0, 0, 0);
  const today = now;
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const diffInDays =
    (dateValue.getTime() - today.getTime()) / (1000 * 3600 * 24);
  if (diffInDays === -1) {
    return "Yesterday";
  } else if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "Tomorrow";
  } else {
    return new Date(value).toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }
}

export function getCurrentAcademicYear(): string {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  if (currentMonth >= 1 && currentMonth <= 7) {
    const academicYearStart = (currentYear - 1) % 100; // Get the last two digits of the previous year
    const academicYearEnd = academicYearStart + 1; // Academic year ends in the next calendar year
    return `${academicYearStart}${academicYearEnd}`;
  }
  const academicYearStart = currentYear % 100; // Get the last two digits of the current year
  const academicYearEnd = academicYearStart + 1; // Academic year ends in the next calendar year
  return `${academicYearStart}${academicYearEnd}`;
}
export function calculateIntervalToTargetDate(startAt: Date, endAt: Date) {
  const currentDate = new Date();
  const endDate = new Date(endAt);
  const startDate = new Date(startAt);
  const timeDifference = endDate.getTime() - currentDate.getTime();
  const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
  if (startDate <= currentDate && currentDate <= endDate) {
    return "Now";
  } else if (daysDifference < 1) {
    const hoursDifference = Math.floor(timeDifference / (1000 * 3600));
    return `${hoursDifference} Hours`;
  } else if (daysDifference === 1) {
    return "Tomorrow";
  }
  return `${daysDifference} Days`;
}
export function GetAdjustedDaysOfWeek(): string[] {
  const today = new Date().getDay();
  const tomorrow = (today + 1) % 7;
  return [
    "Today",
    "Tomorrow",
    ...daysOfWeek.slice(tomorrow + 1),
    ...daysOfWeek.slice(0, today),
  ];
}
export function GetAdjustedDateFromAddedMonths(
  date: Date | undefined,
  months: number | undefined,
  formatFunction: (input: Date | string | undefined) => string
): string {
  if (!date || !months) {
    return "N/A";
  }
  const tempDate = new Date(date);
  tempDate.setMonth(tempDate.getMonth() + months);
  return formatFunction(tempDate);
}
export function GetAbbreviatedDay(weekday: string) {
  const dayMap: { [key: string]: string } = {
    Monday: "M",
    Tuesday: "T",
    Wednesday: "W",
    Thursday: "R",
    Friday: "F",
    Saturday: "S",
    Sunday: "U",
  };
  return dayMap[weekday] || "";
}

export function getOffsetDate(referenceDate: Date, offset: number): Date {
  const offsetDate = new Date(referenceDate);
  offsetDate.setDate(referenceDate.getDate() + offset);
  return offsetDate;
}

export const getStartOfWeek = (): Date => {
  const start = new Date();
  const day = start.getDay();
  start.setDate(start.getDate() - day);
  return start;
};

export const formatTo12Hour = (
  time?: string,
  hourFormat: "numeric" | "2-digit" = "numeric"
) =>
  time
    ? new Date(`1970-01-01T${time}`).toLocaleTimeString("en-US", {
        hour: hourFormat,
        minute: "2-digit",
      })
    : "";
