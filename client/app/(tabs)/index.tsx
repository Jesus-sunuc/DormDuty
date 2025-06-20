import { Card } from "@/components/Card";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRoomsQuery } from "@/hooks/roomHooks";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

export default function HomeScreen() {
  const { data: rooms } = useRoomsQuery();

  return (
    <ParallaxScrollView>
      <ThemedView>
        <ThemedText
          type="title"
          className="text-2xl font-grotesk mb-4 dark:text-gray-200"
        >
          Your Rooms
        </ThemedText>

        {rooms.map((room) => (
          <Card key={room.roomId}>
            <View className="flex-row items-center mb-1">
              <Ionicons name="home-outline" size={18} color="#6b7280" />
              <ThemedText className="ml-2 font-semibold text-base dark:text-gray-200">
                {room.name}
              </ThemedText>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="key-outline" size={16} color="#9ca3af" />
              <ThemedText className="ml-2 text-xs text-muted dark:text-gray-300">
                Code: {room.roomCode}
              </ThemedText>
            </View>
          </Card>
        ))}
      </ThemedView>
    </ParallaxScrollView>
  );
}
