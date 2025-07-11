/* eslint-disable @typescript-eslint/no-explicit-any */
const isoDateTimeFormat =
  /^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d*)?)$/;
const isoDateTimeTimezoneFormat =
  /^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d*)?[+-][0-2]\d:[0-5]\d)$/;

const isoDateFormat = /^\d{4}-\d{2}-\d{2}$/;

export function handleDates(body: any): any {
  if (body === null || body === undefined || typeof body !== "object")
    return body;

  for (const key of Object.keys(body)) {
    const value = body[key];

    if (isIsoDateTimeTimezoneString(value)) body[key] = parseIsoDatetime(value);
    else if (isIsoDateString(value)) body[key] = parseISODate(value);
    else if (isIsoDateTimeString(value)) body[key] = parseIsoDatetime(value);
    else if (typeof value === "object") handleDates(value);
  }
  return body;
}

function parseISODate(input: string): Date {
  return new Date(
    new Date(input).getFullYear(),
    new Date(input).getMonth(),
    new Date(input).getDate() + 1
  );
}

function parseIsoDatetime(input: string): Date {
  // eslint-disable-next-line
  var dt = input.split(/[: \.T-]/).map(parseFloat);

  const year = dt[0];
  const month = dt[1] - 1;
  const day = dt[2];
  const hour = dt[3] || 0;
  const minute = dt[4] || 0;
  const second = dt[5] || 0;
  const millisecond =
    (dt[6] && parseInt(dt[6].toString().substring(0, 3))) || 0;

  return new Date(year, month, day, hour, minute, second, millisecond);
}

function isIsoDateTimeString(value: any): boolean {
  return value && typeof value === "string" && isoDateTimeFormat.test(value);
}

function isIsoDateString(value: any): boolean {
  return value && typeof value === "string" && isoDateFormat.test(value);
}

function isIsoDateTimeTimezoneString(value: any): boolean {
  return (
    value && typeof value === "string" && isoDateTimeTimezoneFormat.test(value)
  );
}
