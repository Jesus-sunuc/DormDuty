export const ROOM_COLORS = [
  "#EF4444", // Red
  "#3B82F6", // Blue
  "#10B981", // Green
  "#8B5CF6", // Violet
  "#F59E0B", // Amber
  "#14B8A6", // Teal
];

export function getRoomColor(id: number | string): string {
  const index =
    typeof id === "string"
      ? id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
      : id;
  return ROOM_COLORS[index % ROOM_COLORS.length];
}
