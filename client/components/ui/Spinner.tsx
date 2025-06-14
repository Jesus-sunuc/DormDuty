import { ActivityIndicator, View } from "react-native";
import { type FC } from "react";

export const Spinner: FC = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
};
