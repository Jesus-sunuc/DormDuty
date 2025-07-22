import React from "react";
import { View, Text } from "react-native";
import { useFirebaseAuth } from "@/contexts/AuthContext";

export default function IndexPage() {
  const { user, loading } = useFirebaseAuth();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900">
        <Text className="text-lg text-gray-600 dark:text-gray-400">
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900">
      <Text className="text-lg text-gray-600 dark:text-gray-400">
        {user ? "Redirecting to Home..." : "Redirecting to Login..."}
      </Text>
    </View>
  );
}