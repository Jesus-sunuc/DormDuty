import { Stack } from "expo-router";

export default function RoomsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[roomId]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[roomId]/add"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[roomId]/edit/[choreId]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
