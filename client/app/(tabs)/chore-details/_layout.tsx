import { Stack } from "expo-router";

export default function ChoreDetailsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[choreId]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
