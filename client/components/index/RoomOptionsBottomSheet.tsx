import { Modal, Pressable, View } from "react-native";
import { ThemedText } from "../ThemedText";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from '@expo/vector-icons/Feather';

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
      <Pressable className="flex-1 bg-black/40" onPress={onClose}>
        <View className="absolute bottom-0 w-full bg-white dark:bg-neutral-800 rounded-t-xl p-4">
          <View className="w-12 h-1.5 bg-gray-400 rounded-full self-center mb-2" />

          <ActionItem
            label="Edit"
            icon={<SimpleLineIcons name="pencil" size={18} color="#9ca3af" />}
            onPress={() => {
              onEdit();
              onClose();
            }}
          />

          {onShareCode && (
            <ActionItem
              label="Share invite link"
              icon={
                <FontAwesome6 name="share-square" size={18} color="#9ca3af" />
              }
              onPress={() => {
                onShareCode();
                onClose();
              }}
            />
          )}

          {onDelete && (
            <ActionItem
              label="Delete"
              icon={<Ionicons name="trash-outline" size={20} color="#9ca3af" />}
              onPress={() => {
                onDelete();
                onClose();
              }}
            />
          )}

          <ActionItem label="Cancel" onPress={onClose} icon={<Feather name="x" size={20} color="#9ca3af" />} />
        </View>
      </Pressable>
    </Modal>
  );
};

const ActionItem = ({ label, icon, onPress }: ActionItemProps) => (
  <Pressable
    onPress={onPress}
    className="flex-row items-center gap-2 px-4 py-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
  >
    {icon}
    <ThemedText className="text-lg text-gray-800 dark:text-gray-100">
      {label}
    </ThemedText>
  </Pressable>
);
