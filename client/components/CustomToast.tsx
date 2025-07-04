import React from 'react';
import { View, Text, StyleSheet, useColorScheme, ColorSchemeName } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface ToastProps {
  text1?: string;
  text2?: string;
}

export const SuccessToast: React.FC<ToastProps> = ({ text1, text2 }) => {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);
  
  return (
    <View style={styles.successContainer}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark" size={18} color={colorScheme === 'dark' ? "#3cd58b" : "#218358"} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.successText}>{text1}</Text>
        {text2 && <Text style={styles.successSubText}>{text2}</Text>}
      </View>
    </View>
  );
};

export const ErrorToast: React.FC<ToastProps> = ({ text1, text2 }) => {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);
  
  return (
    <View style={styles.errorContainer}>
      <View style={styles.errorIcon}>
        <Ionicons name="close" size={18} color="white" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.errorText}>{text1}</Text>
        {text2 && <Text style={styles.errorSubText}>{text2}</Text>}
      </View>
    </View>
  );
};

export const InfoToast: React.FC<ToastProps> = ({ text1, text2 }) => {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);
  
  return (
    <View style={styles.infoContainer}>
      <View style={styles.infoIcon}>
        <Ionicons name="information" size={18} color="white" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.infoText}>{text1}</Text>
        {text2 && <Text style={styles.infoSubText}>{text2}</Text>}
      </View>
    </View>
  );
};

const createStyles = (colorScheme: ColorSchemeName) => StyleSheet.create({
  successContainer: {
    backgroundColor: colorScheme === 'dark' ? '#132d21' : '#f4fbf6',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: '90%',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colorScheme === 'dark' ? '#3cd58b' : '#8eceaa',
  },
  errorContainer: {
    backgroundColor: '#ef4444',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: '90%',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  infoContainer: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: '90%',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  successIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colorScheme === 'dark' ? 'rgba(60, 213, 139, 0.2)' : 'rgba(142, 206, 170, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colorScheme === 'dark' ? 'rgba(60, 213, 139, 0.4)' : 'rgba(142, 206, 170, 0.6)',
  },
  errorIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  textContainer: {
    flex: 1,
  },
  successText: {
    color: colorScheme === 'dark' ? '#3cd58b' : '#218358',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  successSubText: {
    color: '#3cd58b',
    fontSize: 14,
    lineHeight: 18,
    marginTop: 2,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  errorSubText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 18,
    marginTop: 2,
  },
  infoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  infoSubText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 18,
    marginTop: 2,
  },
});
