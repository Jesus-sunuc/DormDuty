import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, children }) => (
  <View className="mb-6">
    <ThemedText className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">
      {label}
    </ThemedText>
    {children}
  </View>
);

interface TextInputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  numberOfLines?: number;
  style?: any;
}

export const TextInputField: React.FC<TextInputFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  numberOfLines,
  style,
}) => (
  <FormField label={label}>
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical={multiline ? "top" : "center"}
      className="bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-600 rounded-2xl px-4 py-4 text-lg text-neutral-900 dark:text-white "
      style={style}
    />
  </FormField>
);

interface PickerFieldProps {
  label: string;
  selectedValue: any;
  onValueChange: (value: any) => void;
  items: { label: string; value: any; key?: string }[];
}

export const PickerField: React.FC<PickerFieldProps> = ({
  label,
  selectedValue,
  onValueChange,
  items,
}) => (
  <FormField label={label}>
    <View className="bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-600 rounded-2xl overflow-hidden ">
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={{ color: "#9ca3af" }}
        dropdownIconColor="#9ca3af"
      >
        {items.map((item) => (
          <Picker.Item
            key={item.key || item.value}
            label={item.label}
            value={item.value}
          />
        ))}
      </Picker>
    </View>
  </FormField>
);

interface DatePickerFieldProps {
  label: string;
  value: string | undefined;
  onDateChange: (date: string) => void;
  placeholder: string;
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  onDateChange,
  placeholder,
}) => {
  const [showPicker, setShowPicker] = React.useState(false);

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) {
      const iso = selectedDate.toISOString().split("T")[0];
      onDateChange(iso);
    }
  };

  const getDateValue = (): Date => {
    if (value) {
      try {
        const dateValue = typeof value === "string" ? value : String(value);
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date;
        }
      } catch (error) {
        console.warn("Error parsing date value:", error);
      }
    }
    return new Date();
  };

  return (
    <FormField label={label}>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        className="bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-600 rounded-2xl px-4 py-4 "
      >
        <Text className="text-neutral-700 dark:text-neutral-300 text-lg">
          {value ? String(value) : placeholder}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={getDateValue()}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handleDateChange}
        />
      )}
    </FormField>
  );
};

interface TimePickerFieldProps {
  label: string;
  value: string;
  onTimeChange: (time: string) => void;
  placeholder: string;
}

export const TimePickerField: React.FC<TimePickerFieldProps> = ({
  label,
  value,
  onTimeChange,
  placeholder,
}) => {
  const [showPicker, setShowPicker] = React.useState(false);

  const handleTimeChange = (event: any, selected: Date | undefined) => {
    setShowPicker(false);
    if (selected) {
      onTimeChange(selected.toTimeString().slice(0, 5));
    }
  };

  const getTimeValue = (): Date => {
    if (value && value.includes(":")) {
      const [hours, minutes] = value.split(":").map((num) => parseInt(num, 10));
      if (
        !isNaN(hours) &&
        !isNaN(minutes) &&
        hours >= 0 &&
        hours < 24 &&
        minutes >= 0 &&
        minutes < 60
      ) {
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
      }
    }
    return new Date();
  };

  return (
    <FormField label={label}>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        className="bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-600 rounded-2xl px-4 py-4 "
      >
        <Text className="text-neutral-700 dark:text-neutral-300 text-lg">
          {value ? String(value) : placeholder}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={getTimeValue()}
          mode="time"
          is24Hour={true}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleTimeChange}
        />
      )}
    </FormField>
  );
};
