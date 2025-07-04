import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import Ionicons from '@expo/vector-icons/Ionicons';
// Note: formatDate should be moved to a utils file, but for now we'll import it relatively
import { formatDate } from '@/app/(tabs)/chores';
import { daysOfWeekFull } from '@/constants/choreConstants';

interface ChoreInfoCardProps {
  frequency?: string;
  startDate?: string;
  dayOfWeek?: number;
  timing?: string;
}

export const ChoreInfoCard: React.FC<ChoreInfoCardProps> = ({
  frequency,
  startDate,
  dayOfWeek,
  timing,
}) => {
  return (
    <View className="bg-white dark:bg-neutral-900 rounded-2xl p-6 mb-6 shadow-sm">
      <ThemedText className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Chore Information
      </ThemedText>
      
      <View className="space-y-4">
        <View className="flex-row items-center py-2">
          <View className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-3">
            <Ionicons name="repeat" size={16} color="#3b82f6" />
          </View>
          <View className="flex-1">
            <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
              Frequency
            </ThemedText>
            <ThemedText className="text-base font-medium text-gray-900 dark:text-gray-100">
              {frequency || "Not set"}
            </ThemedText>
          </View>
        </View>

        {startDate && (
          <View className="flex-row items-center py-2">
            <View className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-3">
              <Ionicons name="calendar" size={16} color="#10b981" />
            </View>
            <View className="flex-1">
              <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                Start Date
              </ThemedText>
              <ThemedText className="text-base font-medium text-gray-900 dark:text-gray-100">
                {formatDate(startDate)}
              </ThemedText>
            </View>
          </View>
        )}

        {dayOfWeek !== undefined && dayOfWeek !== null && (
          <View className="flex-row items-center py-2">
            <View className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 items-center justify-center mr-3">
              <Ionicons name="calendar-outline" size={16} color="#8b5cf6" />
            </View>
            <View className="flex-1">
              <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                Day of Week
              </ThemedText>
              <ThemedText className="text-base font-medium text-gray-900 dark:text-gray-100">
                {daysOfWeekFull[dayOfWeek] || "Invalid day"}
              </ThemedText>
            </View>
          </View>
        )}

        {timing && (
          <View className="flex-row items-center py-2">
            <View className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mr-3">
              <Ionicons name="time-outline" size={16} color="#f59e0b" />
            </View>
            <View className="flex-1">
              <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                Due Time
              </ThemedText>
              <ThemedText className="text-base font-medium text-gray-900 dark:text-gray-100">
                {timing}
              </ThemedText>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};
