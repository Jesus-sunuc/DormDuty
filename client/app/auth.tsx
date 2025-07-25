import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useFirebaseAuth } from "@/contexts/AuthContext";
import { toastError } from "@/components/ToastService";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();

  const { signIn, signUp } = useFirebaseAuth();

  const handleSubmit = async () => {
    if (!email || !password) {
      toastError("Please fill in all fields");
      return;
    }

    if (!isLogin && !name) {
      toastError("Please enter your name");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      toastError("Passwords do not match");
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
      toastError(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      style={{
        backgroundColor: colorScheme === "dark" ? "#1c1c1e" : "#f5f7f4",
      }}
    >
      <View className="flex-1 justify-center px-8">
        <View className="items-center mb-8">
          <Image
            source={require("@/assets/images/banner.png")}
            style={{
              width: "70%",
              height: 70,
            }}
            resizeMode="contain"
          />
        </View>

        <View
          className="rounded-2xl p-8 shadow-lg"
          style={{
            backgroundColor: colorScheme === "dark" ? "#262626" : "#ffffff",
            shadowColor: colorScheme === "dark" ? "#000000" : "#000000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Text
            className="text-3xl font-bold text-center mb-8"
            style={{
              color: colorScheme === "dark" ? "#f1f5f9" : "#1b1f22",
            }}
          >
            {isLogin ? "Welcome Back" : "Create Account"}
          </Text>

          <View className="space-y-4">
            {!isLogin && (
              <View>
                <Text
                  className="text-sm font-medium mb-1"
                  style={{
                    color: colorScheme === "dark" ? "#f1f5f9" : "#1b1f22",
                  }}
                >
                  Name
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  autoCapitalize="words"
                  className="rounded-lg px-4 py-3"
                  style={{
                    backgroundColor:
                      colorScheme === "dark" ? "#3a3a3a" : "#d6e0da",
                    color: colorScheme === "dark" ? "#f1f5f9" : "#1b1f22",
                  }}
                  placeholderTextColor={
                    colorScheme === "dark" ? "#a3bcc9ad" : "#6b7280"
                  }
                />
              </View>
            )}

            <View>
              <Text
                className="text-sm font-medium mb-1 mt-2"
                style={{
                  color: colorScheme === "dark" ? "#f1f5f9" : "#1b1f22",
                }}
              >
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                className="rounded-lg px-4 py-3"
                style={{
                  backgroundColor:
                    colorScheme === "dark" ? "#3a3a3a" : "#d6e0da",
                  color: colorScheme === "dark" ? "#f1f5f9" : "#1b1f22",
                }}
                placeholderTextColor={
                  colorScheme === "dark" ? "#a3bcc9ad" : "#6b7280"
                }
              />
            </View>

            <View>
              <Text
                className="text-sm font-medium mb-1 mt-2"
                style={{
                  color: colorScheme === "dark" ? "#f1f5f9" : "#1b1f22",
                }}
              >
                Password
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                className="rounded-lg px-4 py-3"
                style={{
                  backgroundColor:
                    colorScheme === "dark" ? "#3a3a3a" : "#d6e0da",
                  color: colorScheme === "dark" ? "#f1f5f9" : "#1b1f22",
                }}
                placeholderTextColor={
                  colorScheme === "dark" ? "#a3bcc9ad" : "#6b7280"
                }
              />
            </View>

            {!isLogin && (
              <View>
                <Text
                  className="text-sm font-medium mb-1 mt-2"
                  style={{
                    color: colorScheme === "dark" ? "#f1f5f9" : "#1b1f22",
                  }}
                >
                  Confirm Password
                </Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  secureTextEntry
                  className="rounded-lg px-4 py-3"
                  style={{
                    backgroundColor:
                      colorScheme === "dark" ? "#3a3a3a" : "#d6e0da",
                    color: colorScheme === "dark" ? "#f1f5f9" : "#1b1f22",
                  }}
                  placeholderTextColor={
                    colorScheme === "dark" ? "#a3bcc9ad" : "#6b7280"
                  }
                />
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="mt-8 py-4 rounded-lg"
            style={{
              backgroundColor: loading
                ? colorScheme === "dark"
                  ? "#3a3a3a"
                  : "#d6e0da"
                : colorScheme === "dark"
                  ? "#34d399"
                  : "#10b981",
            }}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text
              style={{
                color: colorScheme === "dark" ? "#a3bcc9ad" : "#6b7280",
              }}
            >
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text
                className="font-semibold"
                style={{
                  color: colorScheme === "dark" ? "#34d399" : "#10b981",
                }}
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
