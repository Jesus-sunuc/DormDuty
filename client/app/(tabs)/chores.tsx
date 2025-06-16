import { useChoresQuery } from "@/hooks/choreHooks";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { View } from "react-native";
import { formatDistance } from "date-fns";
import { Card } from "@/components/Card";

export default function ChoresScreen() {
  const { data: chores = [] } = useChoresQuery();

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "Never";
    return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
  };

  return (
    <ParallaxScrollView>
      <ThemedView className="px-4 pt-6">
        <ThemedText type="title" className="text-2xl font-bold mb-4">My Chores</ThemedText>

        {chores.length === 0 ? (
          <ThemedText className="text-center mt-10 text-gray-500">No chores assigned yet!</ThemedText>
        ) : (
          chores.map((chore) => (
            <Card key={chore.choreId}>
              <ThemedText className="text-lg font-semibold text-blue-600 mb-2">
                {chore.name}
              </ThemedText>

              <View className="flex-row justify-between mb-1">
                <ThemedText className="text-gray-500">Frequency:</ThemedText>
                <ThemedText>{chore.frequencyValue} {chore.frequency}</ThemedText>
              </View>

              <View className="flex-row justify-between mb-1">
                <ThemedText className="text-gray-500">Last completed:</ThemedText>
                <ThemedText>{formatDate(chore.lastCompleted)}</ThemedText>
              </View>

              <View className="flex-row justify-between mb-2">
                <ThemedText className="text-gray-500">Assigned to:</ThemedText>
                <ThemedText>{chore.assignedTo?.toString() || "Unassigned"}</ThemedText>
              </View>

              <View className="border-t border-gray-200 mt-3 pt-2">
                <ThemedText className="text-xs text-gray-400">
                  Created: {formatDate(chore.createdAt)}
                </ThemedText>
                <ThemedText className="text-xs text-gray-400">
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
