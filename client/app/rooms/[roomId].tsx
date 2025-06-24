import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useChoresByRoomQuery } from "@/hooks/choreHooks";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import { View, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { Card } from "@/components/Card"; 

const RoomChoresScreen = () => {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const router = useRouter();

  return (
    <LoadingAndErrorHandling>
      <ParallaxScrollView>
        <View>
          <Pressable onPress={() => router.back()} className="mb-4">
            <Ionicons name="arrow-back" size={28} color="#9ca3af" />
          </Pressable>
          <ChoreList roomId={roomId} />
        </View>
      </ParallaxScrollView>
    </LoadingAndErrorHandling>
  );
};

export default RoomChoresScreen;

const ChoreList = ({ roomId }: { roomId: string }) => {
  const { data: chores } = useChoresByRoomQuery(roomId);

  if (!chores.length) {
    return (
      <ThemedText className="text-center text-gray-400">
        No chores in this room yet.
      </ThemedText>
    );
  }

  return (
    <>
      {chores.map((chore) => (
        <Card key={chore.choreId}>
          <ThemedText className="font-semibold text-lg text-gray-700 dark:text-gray-200">
            {chore.name}
          </ThemedText>
          <ThemedText
            className={chore.isActive ? "text-green-400" : "text-red-400"}
          >
            {chore.isActive ? "Active" : "Inactive"}
          </ThemedText>
        </Card>
      ))}
    </>
  );
};