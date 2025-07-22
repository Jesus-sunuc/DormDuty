import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useFirebaseAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useFirebaseAuth();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!isLogin && !name) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50 dark:bg-gray-900"
    >
      <View className="flex-1 justify-center px-8">
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <Text className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
            {isLogin ? "Welcome Back" : "Create Account"}
          </Text>

          <View className="space-y-4">
            {!isLogin && (
              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  autoCapitalize="words"
                  className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 text-gray-800 dark:text-white"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            )}

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 text-gray-800 dark:text-white"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 text-gray-800 dark:text-white"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {!isLogin && (
              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  secureTextEntry
                  className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 text-gray-800 dark:text-white"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`mt-8 py-4 rounded-lg ${
              loading
                ? "bg-gray-400 dark:bg-gray-600"
                : "bg-blue-600 dark:bg-blue-500"
            }`}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600 dark:text-gray-400">
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text className="text-blue-600 dark:text-blue-400 font-semibold">
                {isLogin ? "Sign Up" : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
