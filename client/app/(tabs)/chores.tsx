import { useChoresAssignedToUserQuery } from "@/hooks/choreHooks";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { View, Pressable } from "react-native";
import { formatDistance } from "date-fns";
import { Card } from "@/components/Card";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getRoomColor } from "@/utils/colorUtils";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import ParallaxScrollViewY from "@/components/ParallaxScrollViewY";
import { useRouter } from "expo-router";

export default function ChoresScreen() {
  const { data: chores = [] } = useChoresAssignedToUserQuery();
  const router = useRouter();

  return (
    <LoadingAndErrorHandling>
      <View className="flex-1 bg-white dark:bg-black">
        <View className="flex-row justify-between items-center px-6 mt-12 py-4 border-b-2 border-gray-200 dark:border-gray-500 bg-white dark:bg-black">
          <ThemedText
            type="title"
            className="text-2xl font-grotesk dark:text-gray-200 mb-1"
          >
            My Chores
          </ThemedText>
        </View>
        <ParallaxScrollViewY>
          {chores.length === 0 ? (
            <ThemedText className="text-center text-muted mt-10">
              No chores assigned yet!
            </ThemedText>
          ) : (
            chores.map((chore) => {
              return (
                <Pressable
                  key={chore.choreId}
                  onPress={() =>
                    router.push(
                      `/chore-details/${chore.choreId}?roomId=${chore.roomId}`
                    )
                  }
                >
                  <Card className="flex-row items-center">
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
                          <ThemedText className="text-sm text-muted dark:text-gray-300 ms-1">
                            Last completed:
                          </ThemedText>
                        </View>
                        <ThemedText className="text-sm font-medium dark:text-gray-100">
                          {formatDate(chore.lastCompleted)}
                        </ThemedText>
                      </View>
                    </View>
                  </Card>
                </Pressable>
              );
            })
          )}
        </ParallaxScrollViewY>
      </View>
    </LoadingAndErrorHandling>
  );
}

export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "Never";
  return formatDistance(new Date(dateString), new Date(), {
    addSuffix: true,
  });
};
