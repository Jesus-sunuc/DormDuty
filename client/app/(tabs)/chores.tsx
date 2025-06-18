import { useChoresQuery } from "@/hooks/choreHooks";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { View } from "react-native";
import { formatDistance } from "date-fns";
import { Card } from "@/components/Card";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

export default function ChoresScreen() {
  const { data: chores = [] } = useChoresQuery();

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "Never";
    return formatDistance(new Date(dateString), new Date(), {
      addSuffix: true,
    });
  };

  return (
    <ParallaxScrollView>
      <ThemedView className="px-2">
        <ThemedView className="mb-4">
          <ThemedText type="title">My Chores</ThemedText>
        </ThemedView>

        {chores.length === 0 ? (
          <ThemedText className="text-center mt-10 text-muted">
            No chores assigned yet!
          </ThemedText>
        ) : (
          chores.map((chore) => (
            <Card key={chore.choreId}>
              <ThemedText className="text-lg font-semibold mb-2">
                {chore.name}
              </ThemedText>

              <View className="flex-row justify-between mb-1">
                <ThemedText type="subtitle" className="text-muted">
                  Frequency:
                </ThemedText>
                <ThemedText type="defaultSemiBold">
                  {chore.frequencyValue} {chore.frequency}
                </ThemedText>
              </View>

              <View className="flex-row justify-between mb-1">
                <ThemedText type="subtitle" className="text-muted">
                  Last completed:
                </ThemedText>
                <ThemedText type="defaultSemiBold">
                  {formatDate(chore.lastCompleted)}
                </ThemedText>
              </View>

              <View className="flex-row justify-between mb-2">
                <ThemedText type="subtitle" className="text-muted">
                  Assigned to:
                </ThemedText>
                <ThemedText type="defaultSemiBold">
                  {chore.assignedTo?.toString() || "Unassigned"}
                </ThemedText>
              </View>

              <View className="border-t border-muted mt-3 pt-2">
                <ThemedText className="text-xs text-muted">
                  Created: {formatDate(chore.createdAt)}
                </ThemedText>
                <ThemedText className="text-xs text-muted">
                  Updated: {formatDate(chore.updatedAt)}
                </ThemedText>
              </View>
            </Card>
          ))
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}
