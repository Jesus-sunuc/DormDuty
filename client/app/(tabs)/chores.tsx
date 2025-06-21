import { useChoresQuery } from "@/hooks/choreHooks";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { TouchableOpacity, View } from "react-native";
import { formatDistance } from "date-fns";
import { Card } from "@/components/Card";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getRoomColor } from "@/utils/colorUtils";

export default function ChoresScreen() {
  const { data: chores = [] } = useChoresQuery();

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "Never";
    return formatDistance(new Date(dateString), new Date(), {
      addSuffix: true,
    });
  };

  return (
    <>
      <ParallaxScrollView>
        <ThemedView className="pt-3">
          <ThemedText
            type="title"
            className="text-2xl font-grotesk mb-3 dark:text-gray-200"
          >
            My Chores
          </ThemedText>

          {chores.length === 0 ? (
            <ThemedText className="text-center text-muted mt-10">
              No chores assigned yet!
            </ThemedText>
          ) : (
            chores.map((chore) => {
              const roomColor = getRoomColor(chore.roomId);

              return (
                <Card key={chore.choreId} className="flex-row items-center">
                  <View
                    style={{
                      backgroundColor: getRoomColor(chore.roomId),
                      width: 6,
                      height: "100%",
                    }}
                    className="rounded-l-xl"
                  />
                  <View className="flex-1 pl-4">
                    <ThemedText className="text-lg font-semibold mb-2 font-grotesk dark:text-gray-100">
                      {chore.name}
                    </ThemedText>

                    <View className="flex-row justify-between mb-1">
                      <View className="flex-row items-center space-x-1">
                        <Ionicons
                          name="time-outline"
                          size={16}
                          color="#9ca3af"
                        />
                        <ThemedText className="text-sm text-muted dark:text-gray-300">
                          Last completed:
                        </ThemedText>
                      </View>
                      <ThemedText className="text-sm font-medium dark:text-gray-100">
                        {formatDate(chore.lastCompleted)}
                      </ThemedText>
                    </View>

                    <View className="flex-row justify-between">
                      <View className="flex-row items-center space-x-1">
                        <Ionicons
                          name="person-outline"
                          size={16}
                          color="#9ca3af"
                        />
                        <ThemedText className="text-sm text-muted dark:text-gray-300">
                          Assigned to:
                        </ThemedText>
                      </View>
                      <ThemedText className="text-sm font-medium dark:text-gray-100">
                        {chore.assignedTo?.toString() || "Unassigned"}
                      </ThemedText>
                    </View>
                  </View>
                </Card>
              );
            })
          )}
        </ThemedView>
      </ParallaxScrollView>

      <TouchableOpacity
        onPress={() => {
          // TODO: navigate to Add Chore screen or open modal
        }}
        className="absolute bottom-6 right-6 bg-customGreen-500 p-4 rounded-full"
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </>
  );
}
