import ParallaxScrollView from "@/components/ParallaxScrollView";
import { useAuth } from "@/hooks/user/useAuth";
import { Text, Pressable } from "react-native";

const SettingsScreen = () => {
  const { user, users, switchUser } = useAuth();

  return (
    <ParallaxScrollView>
      <Text className="text-lg font-bold mb-4">Dev: Switch User</Text>

      {users.map((u) => (
        <Pressable
          key={u.userId}
          onPress={() => switchUser(u.userId)}
          className="py-2"
        >
          <Text className={u.userId === user?.userId ? "font-bold" : ""}>
            {u.name} ({u.email})
          </Text>
        </Pressable>
      ))}

      <Text className="text-xs text-gray-500 mt-4">
        Current: {user?.name} ({user?.email})
      </Text>
    </ParallaxScrollView>
  );
};

export default SettingsScreen;
