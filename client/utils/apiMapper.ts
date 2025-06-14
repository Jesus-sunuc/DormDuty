/* eslint-disable @typescript-eslint/no-explicit-any */
const isArray = function (a: any): boolean {
  return Array.isArray(a);
};

const isObject = function (o: any): boolean {
  return o === Object(o) && !isArray(o) && typeof o !== "function";
};

const toCamel = (s: string): string => {
  return s.replace(/([-_][a-z])/gi, ($1: string) => {
    return $1.toUpperCase().replace("-", "").replace("_", "");
  });
};

const to_snake = (s: string): string => {
  return s.replace(/([A-Z])/g, ($1: string) => {
    return "_" + $1.toLowerCase();
  });
};

export const snakeToCamel = <T>(o: any): T => {
  if (isObject(o)) {
    const n: { [key: string]: any } = {};

    Object.keys(o).forEach((k) => {
      n[toCamel(k)] = snakeToCamel(o[k]);
    });

    return n as T;
  } else if (isArray(o)) {
    return o.map((i: any) => {
      return snakeToCamel(i);
    }) as any;
  }

  return o as T;
};

export const camel_to_snake = <T>(o: any): T => {
  if (isObject(o)) {
    const n: { [key: string]: any } = {};

    Object.keys(o).forEach((k) => {
      n[to_snake(k)] = camel_to_snake(o[k]);
    });

    return n as T;
  } else if (isArray(o)) {
    return o.map((i: any) => {
      return camel_to_snake(i);
    }) as any;
  }

  return o as T;
};

export const camel_to_snake_serializing_date = <T>(o: any): T => {
  if (o instanceof Date) {
    const isoString = o.toISOString();
    return isoString.replace(/\.\d{3}Z$/, "Z") as any;
  } else if (isObject(o)) {
    const n: { [key: string]: any } = {};

    Object.keys(o).forEach((k) => {
      n[to_snake(k)] = camel_to_snake_serializing_date(o[k]);
    });

    return n as T;
  } else if (isArray(o)) {
    return o.map((i: any) => {
      return camel_to_snake_serializing_date(i);
    }) as any;
  }

  return o as T;
};
