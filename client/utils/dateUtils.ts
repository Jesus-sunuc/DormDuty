/**
 * Safely converts various date representations to ISO date string format (YYYY-MM-DD)
 * Handles Date objects, strings, and undefined values
 */
export const toISODateString = (value: string | Date | undefined | null): string | undefined => {
  if (!value) return undefined;
  
  try {
    if (typeof value === 'string') {
      // If it's already a string, validate it's a proper date
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return value.includes('T') ? value.split('T')[0] : value;
      }
    } else if (value instanceof Date) {
      // Convert Date object to ISO string
      if (!isNaN(value.getTime())) {
        return value.toISOString().split('T')[0];
      }
    } else {
      // Try to convert unknown type to Date first
      const date = new Date(value as any);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
  } catch (error) {
    console.warn('Error converting date value:', error);
  }
  
  return undefined;
};

/**
 * Safely converts time string from "HH:MM:SS" to "HH:MM" format
 */
export const toTimeString = (value: string | undefined): string => {
  if (!value) return "";
  return value.includes(':') ? value.split(':').slice(0, 2).join(':') : value;
};
