export const ROOM_COLORS = [
  "#FFEDD5", // soft orange
  "#DBEAFE", // soft blue
  "#DCFCE7", // soft green
  "#FCE7F3", // soft pink
  "#FEF9C3", // soft yellow
  "#E0E7FF", // soft indigo
];

export function getRoomColor(id: number | string): string {
  const index =
    typeof id === "string"
      ? id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
      : id;
  return ROOM_COLORS[index % ROOM_COLORS.length];
}
