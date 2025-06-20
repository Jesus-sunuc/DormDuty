import { useChoresQuery } from "@/hooks/choreHooks";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { View } from "react-native";
import { formatDistance } from "date-fns";
import { Card } from "@/components/Card";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";

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
      <ThemedView className="pt-3">
        <ThemedText type="title" className="text-2xl font-grotesk mb-3 dark:text-gray-200">
          My Chores
        </ThemedText>

        {chores.length === 0 ? (
          <ThemedText className="text-center text-muted mt-10">
            No chores assigned yet!
          </ThemedText>
        ) : (
          chores.map((chore) => (
            <Card key={chore.choreId}>
              <ThemedText className="text-lg font-semibold mb-2 font-grotesk dark:text-gray-200">
                {chore.name}
              </ThemedText>

              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center space-x-1">
                  <Ionicons name="time-outline" size={16} color="#9ca3af" />
                  <ThemedText className="px-1 text-sm text-muted dark:text-gray-100">
                    Last completed:
                  </ThemedText>
                </View>
                <ThemedText className="text-sm font-medium dark:text-gray-100">
                  {formatDate(chore.lastCompleted)}
                </ThemedText>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center space-x-1">
                  <Ionicons name="person-outline" size={16} color="#9ca3af" />
                  <ThemedText className="text-sm px-1 text-muted dark:text-gray-100">
                    Assigned to:
                  </ThemedText>
                </View>
                <ThemedText className="text-sm font-medium dark:text-gray-100">
                  {chore.assignedTo?.toString() || "Unassigned"}
                </ThemedText>
              </View>
            </Card>
          ))
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}
