import { Stack } from "expo-router";

export default function ExpensesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "card",
      }}
    >
      <Stack.Screen
        name="add"
        options={{
          headerShown: false,
          presentation: "card",
        }}
      />
    </Stack>
  );
}
