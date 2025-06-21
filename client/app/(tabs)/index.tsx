import { Card } from "@/components/Card";
import { RoomCreateModal } from "@/components/index/RoomCreateModal";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useRoomsQuery } from "@/hooks/roomHooks";
import { getRoomColor } from "@/utils/colorUtils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";

export default function HomeScreen() {
  const { data: rooms } = useRoomsQuery();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <ParallaxScrollView>
        <View>
          <ThemedText
            type="title"
            className="text-2xl font-grotesk mb-4 dark:text-gray-200"
          >
            Your Rooms
          </ThemedText>

          {rooms.map((room) => {
            return (
              <Card key={room.roomId} className="flex-row items-center pe-2 ps-2">
                <View
                  style={{
                    backgroundColor: getRoomColor(room.roomId),
                    width: 6,
                    height: "100%",
                  }}
                  className="rounded-l-xl"
                />
                <View className="p-3 flex-1">
                  <View className="flex-row items-center">
                    <Ionicons name="people-outline" size={22} color="#9ca3af" />
                    <ThemedText className="ml-2 text-lg font-semibold dark:text-gray-100">
                      {room.name}
                    </ThemedText>
                    <View className="ml-auto -mt-8">
                      <Entypo
                        name="dots-three-horizontal"
                        size={24}
                        color="#9ca3af"
                      />
                    </View>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      </ParallaxScrollView>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="absolute bottom-6 right-6 bg-customGreen-500 p-4 rounded-full"
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      <RoomCreateModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}
