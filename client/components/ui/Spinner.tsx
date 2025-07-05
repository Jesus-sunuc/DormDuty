import { ActivityIndicator, View } from "react-native";
import { type FC } from "react";
import { ThemedText } from "../ThemedText";

export const Spinner: FC<{ text?: string }> = ({ text = "Loading..." }) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <ActivityIndicator size="large" color="#007AFF" />
      {text && (
        <ThemedText
          style={{
            marginTop: 16,
            textAlign: "center",
            color: "#666",
            fontSize: 16,
          }}
        >
          {text}
        </ThemedText>
      )}
    </View>
  );
};
