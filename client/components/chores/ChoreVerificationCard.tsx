import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ChoreVerification } from "@/models/Chore";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";

interface ChoreVerificationCardProps {
  verification: ChoreVerification;
}

export const ChoreVerificationCard: React.FC<ChoreVerificationCardProps> = ({
  verification,
}) => {
  if (verification.verificationType === "approved") {
    return (
      <Card className="mx-6 mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <View className="flex-row items-center gap-3">
          <Ionicons
            name="checkmark-circle"
            size={24}
            className="text-green-600 dark:text-green-400"
          />
          <View className="flex-1">
            <ThemedText className="font-semibold text-green-800 dark:text-green-200">
              Chore Approved
            </ThemedText>
            <ThemedText className="text-sm text-green-600 dark:text-green-300 mt-1">
              Your completion has been approved!
            </ThemedText>
          </View>
        </View>
      </Card>
    );
  }

  if (verification.verificationType === "rejected") {
    return (
      <Card className="mx-6 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <View className="flex-row items-start gap-3">
          <Ionicons
            name="close-circle"
            size={24}
            className="text-red-600 dark:text-red-400 mt-0.5"
          />
          <View className="flex-1">
            <ThemedText className="font-semibold text-red-800 dark:text-red-200">
              Chore Rejected
            </ThemedText>
            <ThemedText className="text-sm text-red-600 dark:text-red-300 mt-1">
              Your completion was not approved.
            </ThemedText>
            {verification.comment && (
              <View className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <ThemedText className="font-medium text-red-800 dark:text-red-200 text-sm mb-1">
                  Rejection Reason:
                </ThemedText>
                <ThemedText className="text-red-700 dark:text-red-300 text-sm leading-5">
                  {verification.comment}
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </Card>
    );
  }

  return null;
};
