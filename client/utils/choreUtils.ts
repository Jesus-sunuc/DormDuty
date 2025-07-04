import { Chore, ChoreCreateRequest } from "@/models/Chore";

/**
 * Converts a Chore object to a ChoreCreateRequest for updates
 * Strips out the read-only fields and maintains the structure expected by the API
 */
export const choreToUpdateRequest = (chore: Chore): ChoreCreateRequest => {
  return {
    roomId: chore.roomId,
    name: chore.name,
    frequency: chore.frequency,
    frequencyValue: chore.frequencyValue,
    dayOfWeek: chore.dayOfWeek,
    timing: chore.timing,
    description: chore.description,
    startDate: chore.startDate,
    assignedTo: chore.assignedTo,
    isActive: chore.isActive,
  };
};

/**
 * Validates if a chore update request has all required fields
 */
export const validateChoreRequest = (chore: ChoreCreateRequest): string[] => {
  const errors: string[] = [];
  
  if (!chore.name?.trim()) {
    errors.push("Chore name is required");
  }
  
  if (!chore.roomId || chore.roomId <= 0) {
    errors.push("Valid room ID is required");
  }
  
  if (!chore.frequency?.trim()) {
    errors.push("Frequency is required");
  }
  
  return errors;
};
