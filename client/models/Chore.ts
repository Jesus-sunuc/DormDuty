export interface Chore {
    choreId: number;
    roomId: number;
    name: string;
    frequency: string;
    frequencyValue?: number;
    dayOfWeek?: number;
    timing?: string;
    lastCompleted?: string;
    assignedTo?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ChoreCreateRequest {
    roomId: number;
    name: string;
    frequency: string;
    frequencyValue?: number;
    dayOfWeek?: number;
    timing?: string;
    assignedTo?: number;
    isActive?: boolean;
}