import { useChores } from "@/hooks/choreHooks";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";

export default function ChoresScreen() {
  const { data: chores } = useChores();

  return (
    <ParallaxScrollView>
      <ThemedView>
        <ThemedText type="title">My Chores</ThemedText>
      </ThemedView>
      {chores.map((item) => (
        <ThemedText key={item.choreId}>{item.name}</ThemedText>
      ))}
    </ParallaxScrollView>
  );
}
