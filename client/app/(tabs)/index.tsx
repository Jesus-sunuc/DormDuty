import { Card } from "@/components/Card";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useRoomsQuery } from "@/hooks/roomHooks";
import { getRoomColor } from "@/utils/colorUtils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

export default function HomeScreen() {
  const { data: rooms } = useRoomsQuery();

  return (
    <ParallaxScrollView>
      <View>
        <ThemedText
          type="title"
          className="text-2xl font-grotesk mb-4 dark:text-gray-200"
        >
          Your Rooms
        </ThemedText>

        {rooms.map((room) => {
          const roomColor = getRoomColor(room.roomId);

          return (
            <Card key={room.roomId} className="flex-row items-center">
              <View
                style={{
                  backgroundColor: getRoomColor(room.roomId),
                  width: 6,
                  height: "100%",
                }}
                className="rounded-l-xl"
              />

              <View className="p-3 pl-4 flex-1">
                <ThemedText className="text-lg font-semibold dark:text-gray-100">
                  {room.name}
                </ThemedText>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="key-outline" size={16} color="#9ca3af" />
                  <ThemedText className="ml-2 text-sm text-muted dark:text-gray-300">
                    Code: {room.roomCode}
                  </ThemedText>
                </View>
              </View>
            </Card>
          );
        })}
      </View>
    </ParallaxScrollView>
  );
}
