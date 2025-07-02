import { Modal, Pressable, View } from "react-native";
import { ThemedText } from "../ThemedText";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";

type Props = {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onShareCode?: () => void;
  onDelete?: () => void;
};

type ActionItemProps = {
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
};

export const RoomOptionsBottomSheet = ({
  visible,
  onClose,
  onEdit,
  onShareCode: onShareCode,
  onDelete,
}: Props) => {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/50" onPress={onClose}>
        <View className="absolute bottom-0 w-full bg-white dark:bg-neutral-900 rounded-t-3xl p-6 shadow-2xl">
          <View className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full self-center mb-6" />
          
          <View className="mb-6">
            <ThemedText className="text-lg font-bold text-gray-900 dark:text-white text-center">
              Room Options
            </ThemedText>
            <ThemedText className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
              Manage your apartment settings
            </ThemedText>
          </View>

          <View className="space-y-2">
            <ActionItem
              label="Edit Room"
              icon={<SimpleLineIcons name="pencil" size={18} color="#3b82f6" />}
              onPress={() => {
                onEdit();
                onClose();
              }}
            />

            {onShareCode && (
              <ActionItem
                label="Share Invite Link"
                icon={
                  <FontAwesome6 name="share-square" size={18} color="#10b981" />
                }
                onPress={() => {
                  onShareCode();
                  onClose();
                }}
              />
            )}

            {onDelete && (
              <ActionItem
                label="Delete Room"
                icon={<Ionicons name="trash-outline" size={20} color="#ef4444" />}
                onPress={() => {
                  onDelete();
                  onClose();
                }}
              />
            )}
          </View>

          <View className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
            <Pressable
              onPress={onClose}
              className="bg-gray-100 dark:bg-neutral-800 rounded-2xl p-4 items-center border border-gray-200 dark:border-neutral-700"
            >
              <ThemedText className="text-base font-medium text-gray-600 dark:text-gray-400">
                Cancel
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const ActionItem = ({ label, icon, onPress }: ActionItemProps) => (
  <Pressable
    onPress={onPress}
    className="flex-row items-center bg-gray-50 dark:bg-neutral-800 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-neutral-700 active:bg-gray-100 dark:active:bg-neutral-700"
  >
    <View className="w-10 h-10 rounded-full bg-white dark:bg-neutral-700 items-center justify-center mr-4 shadow-sm">
      {icon}
    </View>
    <ThemedText className="text-base font-medium text-gray-900 dark:text-gray-100 flex-1">
      {label}
    </ThemedText>
    <View className="w-6 h-6 rounded-full bg-gray-200 dark:bg-neutral-600 items-center justify-center">
      <Ionicons name="chevron-forward" size={12} color="#6b7280" />
    </View>
  </Pressable>
);
