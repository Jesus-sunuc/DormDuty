import { useChores } from "@/hooks/choreHooks";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { FlatList, StyleSheet } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";

export default function ChoresScreen() {
  const { data: chores, isLoading, error } = useChores();

  if (isLoading) return <ThemedText>Loading chores...</ThemedText>;
  if (error) return <ThemedText>Error loading chores</ThemedText>;

  return (
    <ParallaxScrollView>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">My Chores</ThemedText>
      </ThemedView>
      <FlatList
        data={chores}
        keyExtractor={(item) => item.choreId.toString()}
        renderItem={({ item }) => (
          <ThemedText>{item.name}</ThemedText>
        )}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
});
