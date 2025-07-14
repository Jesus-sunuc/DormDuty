import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ChoreSwapRequest } from "@/models/ChoreSwapRequest";
import {
  useRespondToSwapRequestMutation,
  useCancelSwapRequestMutation,
} from "@/hooks/choreSwapHooks";
import { toastError, toastSuccess } from "@/components/ToastService";
import { formatDate } from "@/app/(tabs)/chores";

interface SwapRequestCardProps {
  request: ChoreSwapRequest;
  currentMembershipId: number;
  onRequestUpdate?: () => void;
}

export const SwapRequestCard: React.FC<SwapRequestCardProps> = ({
  request,
  currentMembershipId,
  onRequestUpdate,
}) => {
  const respondMutation = useRespondToSwapRequestMutation();
  const cancelMutation = useCancelSwapRequestMutation();

  const isRequester = request.fromMembership === currentMembershipId;
  const isRecipient = request.toMembership === currentMembershipId;
  const canRespond = isRecipient && request.status === "pending";
  const canCancel = isRequester && request.status === "pending";

  const handleAccept = () => {
    respondMutation.mutate(
      {
        swapId: request.swapId,
        response: { status: "accepted" },
      },
      {
        onSuccess: () => {
          toastSuccess("Chore swap accepted! Assignment has been transferred.");
          onRequestUpdate?.();
        },
        onError: () => {
          toastError("Failed to accept swap request");
        },
      }
    );
  };

  const handleDecline = () => {
    respondMutation.mutate(
      {
        swapId: request.swapId,
        response: { status: "declined" },
      },
      {
        onSuccess: () => {
          toastSuccess("Chore swap declined");
          onRequestUpdate?.();
        },
        onError: () => {
          toastError("Failed to decline swap request");
        },
      }
    );
  };

  const handleCancel = () => {
    cancelMutation.mutate(
      {
        swapId: request.swapId,
        membershipId: currentMembershipId,
      },
      {
        onSuccess: () => {
          toastSuccess("Swap request canceled");
          onRequestUpdate?.();
        },
        onError: () => {
          toastError("Failed to cancel swap request");
        },
      }
    );
  };

  const getStatusColor = () => {
    switch (request.status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "declined":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusIcon = () => {
    switch (request.status) {
      case "pending":
        return "time-outline";
      case "accepted":
        return "checkmark-circle";
      case "declined":
        return "close-circle";
      case "cancelled":
        return "ban-outline";
      default:
        return "help-circle";
    }
  };

  return (
    <View className="bg-white dark:bg-neutral-900 rounded-2xl p-5 mb-4 shadow-sm border border-gray-100 dark:border-neutral-800">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <ThemedText className="text-lg font-bold mb-1 text-gray-700 dark:text-gray-300">
            {request.choreName}
          </ThemedText>
          <View className="flex-row items-center">
            <Ionicons name="swap-horizontal" size={16} color="#6b7280" />
            <ThemedText className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              {isRequester
                ? `You → ${request.toUserName}`
                : `${request.fromUserName} → You`}
            </ThemedText>
          </View>
        </View>
        <View
          className={`px-3 py-1 rounded-full flex-row items-center ${getStatusColor()}`}
        >
          <Ionicons name={getStatusIcon()} size={12} />
          <Text className="text-xs font-medium ml-1 capitalize">
            {request.status}
          </Text>
        </View>
      </View>

      {request.message && (
        <View className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-3 mb-3">
          <ThemedText className="text-sm text-gray-700 dark:text-gray-300">
            "{request.message}"
          </ThemedText>
        </View>
      )}

      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
          <ThemedText className="text-xs text-gray-500 dark:text-gray-400 ml-1">
            Requested {formatDate(request.requestedAt)}
          </ThemedText>
        </View>
        {request.respondedAt && (
          <View className="flex-row items-center">
            <Ionicons name="checkmark-outline" size={14} color="#9ca3af" />
            <ThemedText className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              Responded {formatDate(request.respondedAt)}
            </ThemedText>
          </View>
        )}
      </View>

      {canRespond && (
        <View className="flex-row space-x-3 gap-3">
          <TouchableOpacity
            onPress={handleDecline}
            disabled={respondMutation.isPending}
            className="flex-1 bg-red-100 dark:bg-red-900/30 py-3 rounded-xl flex-row items-center justify-center"
          >
            <Ionicons name="close" size={18} color="#dc2626" />
            <Text className="text-red-600 dark:text-red-400 font-medium ml-2">
              Decline
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAccept}
            disabled={respondMutation.isPending}
            className="flex-1 bg-green-100 dark:bg-green-900/30 py-3 rounded-xl flex-row items-center justify-center"
          >
            <Ionicons name="checkmark" size={18} color="#16a34a" />
            <Text className="text-green-600 dark:text-green-400 font-medium ml-2">
              Accept
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {canCancel && (
        <TouchableOpacity
          onPress={handleCancel}
          disabled={cancelMutation.isPending}
          className="bg-gray-100 dark:bg-neutral-800 py-3 rounded-xl flex-row items-center justify-center"
        >
          <Ionicons name="trash-outline" size={18} color="#6b7280" />
          <Text className="text-gray-600 dark:text-gray-400 font-medium ml-2">
            Cancel Request
          </Text>
        </TouchableOpacity>
      )}

      {(respondMutation.isPending || cancelMutation.isPending) && (
        <View className="absolute inset-0 bg-white/80 dark:bg-neutral-900/80 rounded-2xl flex items-center justify-center">
          <View className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
        </View>
      )}
    </View>
  );
};
