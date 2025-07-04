import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import Ionicons from '@expo/vector-icons/Ionicons';

interface ChoreNotFoundProps {
  onBack: () => void;
}

export const ChoreNotFound: React.FC<ChoreNotFoundProps> = ({ onBack }) => {
  return (
    <View className="flex-1 bg-gray-50 dark:bg-black">
      <View className="bg-white dark:bg-neutral-900 px-6 pt-12 pb-6 shadow-lg">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity 
            onPress={onBack} 
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#6b7280" />
          </TouchableOpacity>
          
          <View className="flex-1 mx-4">
            <ThemedText className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Chore Details
            </ThemedText>
          </View>
          
          <View className="w-10 h-10" />
        </View>
      </View>
      
      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#9ca3af" />
        <ThemedText className="text-center text-gray-400 mt-4 text-lg">
          Chore not found
        </ThemedText>
        <ThemedText className="text-center text-gray-500 mt-2 text-sm">
          This chore may have been deleted or doesn't exist
        </ThemedText>
      </View>
    </View>
  );
};
