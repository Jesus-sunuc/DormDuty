import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useFirebaseAuth } from "@/contexts/AuthContext";
import { toastError, toastSuccess } from "@/components/ToastService";
import { useColorScheme } from "@/hooks/useColorScheme";
import { router } from "expo-router";
import { auth } from "@/firebaseConfig";

export default function VerifyEmailScreen() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [lastSentTime, setLastSentTime] = useState<number | null>(null);
  const [cooldownTime, setCooldownTime] = useState(0);
  const colorScheme = useColorScheme();
  const { firebaseUser, sendEmailVerification, refreshUser, logout } =
    useFirebaseAuth();

  useEffect(() => {
    // If user is already verified, redirect to home
    if (firebaseUser?.emailVerified) {
      router.replace("/(tabs)");
    }

    // Debug: Log current user state
    console.log("Current Firebase User:", {
      uid: firebaseUser?.uid,
      email: firebaseUser?.email,
      emailVerified: firebaseUser?.emailVerified,
      displayName: firebaseUser?.displayName,
    });
  }, [firebaseUser]);

  // Cooldown timer effect
  useEffect(() => {
    let interval: any;

    if (lastSentTime && cooldownTime > 0) {
      interval = setInterval(() => {
        const elapsed = Date.now() - lastSentTime;
        const remaining = Math.max(0, 60000 - elapsed); // 60 second cooldown
        setCooldownTime(Math.ceil(remaining / 1000));

        if (remaining <= 0) {
          setCooldownTime(0);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [lastSentTime, cooldownTime]);

  const handleSendVerification = async () => {
    // Check if we're in cooldown period
    if (lastSentTime && Date.now() - lastSentTime < 60000) {
      const remaining = Math.ceil((60000 - (Date.now() - lastSentTime)) / 1000);
      toastError(
        `Please wait ${remaining} seconds before requesting another email.`
      );
      return;
    }

    setLoading(true);
    try {
      console.log("Attempting to send verification email...");
      await sendEmailVerification();
      console.log("Verification email sent successfully");

      // Set the last sent time and start cooldown
      const now = Date.now();
      setLastSentTime(now);
      setCooldownTime(60);

      toastSuccess(
        "Verification email sent! Check your inbox and spam folder."
      );
    } catch (error: any) {
      console.error("Error sending verification email:", error);

      // Handle specific Firebase errors
      if (error.code === "auth/too-many-requests") {
        toastError(
          "Too many email requests. Please wait a few minutes before trying again."
        );
      } else if (error.code === "auth/user-not-found") {
        toastError("User not found. Please try signing up again.");
      } else if (error.code === "auth/network-request-failed") {
        toastError("Network error. Please check your internet connection.");
      } else {
        toastError(error.message || "Failed to send verification email");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    try {
      console.log("Checking email verification status...");

      // First reload the current user
      await refreshUser();

      // Wait a moment for the state to update
      setTimeout(() => {
        const currentUser = auth.currentUser;
        console.log(
          "After refresh - emailVerified:",
          currentUser?.emailVerified
        );

        if (currentUser?.emailVerified) {
          console.log("Email verified successfully");
          toastSuccess("Email verified successfully!");
          router.replace("/(tabs)");
        } else {
          console.log("Email not verified yet");
          toastError(
            "Email not verified yet. Please check your inbox and click the verification link."
          );
        }
        setChecking(false);
      }, 1000);
    } catch (error: any) {
      console.error("Error checking verification status:", error);
      toastError(error.message || "Failed to check verification status");
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error: any) {
      toastError(error.message || "Failed to logout");
    }
  };

  return (
    <View
      className="flex-1 justify-center px-8"
      style={{
        backgroundColor: colorScheme === "dark" ? "#1c1c1e" : "#f5f7f4",
      }}
    >
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
          className="text-3xl font-bold text-center mb-6"
          style={{
            color: colorScheme === "dark" ? "#f1f5f9" : "#1b1f22",
          }}
        >
          Verify Your Email
        </Text>

        <Text
          className="text-base text-center mb-8 leading-6"
          style={{
            color: colorScheme === "dark" ? "#a3bcc9ad" : "#6b7280",
          }}
        >
          We've sent a verification email to{" "}
          <Text
            style={{
              color: colorScheme === "dark" ? "#34d399" : "#10b981",
              fontWeight: "600",
            }}
          >
            {firebaseUser?.email}
          </Text>
          {"\n\n"}
          Please check your inbox and click the verification link to continue.
        </Text>

        <TouchableOpacity
          onPress={handleSendVerification}
          disabled={loading || cooldownTime > 0}
          className="py-4 rounded-lg mb-4"
          style={{
            backgroundColor:
              loading || cooldownTime > 0
                ? colorScheme === "dark"
                  ? "#3a3a3a"
                  : "#d6e0da"
                : colorScheme === "dark"
                  ? "#34d399"
                  : "#10b981",
          }}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {loading
              ? "Sending..."
              : cooldownTime > 0
                ? `Wait ${cooldownTime}s`
                : "Resend Verification Email"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCheckVerification}
          disabled={checking}
          className="py-4 rounded-lg mb-6"
          style={{
            backgroundColor: colorScheme === "dark" ? "#3a3a3a" : "#d6e0da",
          }}
        >
          <Text
            className="text-center font-semibold text-lg"
            style={{
              color: colorScheme === "dark" ? "#f1f5f9" : "#1b1f22",
            }}
          >
            {checking ? "Checking..." : "I've Verified My Email"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout}>
          <Text
            className="text-center text-sm"
            style={{
              color: colorScheme === "dark" ? "#ef4444" : "#dc2626",
            }}
          >
            Sign out and use a different account
          </Text>
        </TouchableOpacity>
      </View>

      <View className="mt-8">
        <View
          className="p-4 rounded-lg"
          style={{
            backgroundColor: colorScheme === "dark" ? "#1f2937" : "#fef3c7",
            borderColor: colorScheme === "dark" ? "#f59e0b" : "#f59e0b",
            borderWidth: 1,
          }}
        >
          <Text
            className="text-sm text-center leading-5"
            style={{
              color: colorScheme === "dark" ? "#fbbf24" : "#92400e",
            }}
          >
            💡 Tip: Check your spam/junk folder if you don't see the email.
            {"\n"}
            The verification link will expire after 1 hour.{"\n\n"}
            ⏱️ Note: You can only request a verification email once per minute.
          </Text>
        </View>
      </View>
    </View>
  );
}
