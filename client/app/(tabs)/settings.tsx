import ParallaxScrollView from "@/components/ParallaxScrollView";
import { useAuth } from "@/hooks/user/useAuth";
import { Text, Pressable, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";

const SettingsScreen = () => {
  const { user, users, switchUser } = useAuth();

  return (
    <ParallaxScrollView>
      <View className="mt-4">
        <ThemedText className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
          Developer Settings
        </ThemedText>

        <ThemedText className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Switch User
        </ThemedText>

        <View className="bg-white dark:bg-neutral-800 rounded-xl shadow p-4 space-y-2">
          {users.map((u) => (
            <Pressable
              key={u.userId}
              onPress={() => switchUser(u.userId)}
              className={`flex-row items-center justify-between p-3 rounded-lg ${
                u.userId === user?.userId
                  ? "bg-customGreen-100 dark:bg-customGreen-900"
                  : "hover:bg-gray-100 dark:hover:bg-neutral-700"
              }`}
            >
              <View>
                <Text
                  className={`text-base ${
                    u.userId === user?.userId
                      ? "font-bold text-customGreen-700 dark:text-customGreen-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {u.name}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {u.email}
                </Text>
              </View>

              {u.userId === user?.userId && (
                <Ionicons name="checkmark" size={20} color="#10b981" />
              )}
            </Pressable>
          ))}
        </View>
      </View>
    </ParallaxScrollView>
  );
};

export default SettingsScreen;
