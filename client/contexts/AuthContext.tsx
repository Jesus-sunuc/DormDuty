import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  reload,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { User } from "@/models/User";
import { axiosClient } from "@/utils/axiosClient";
import { router } from "expo-router";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useFirebaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useFirebaseAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingUserName, setPendingUserName] = useState<string | null>(null);

  const fetchOrCreateUser = async (
    firebaseUser: FirebaseUser,
    providedName?: string
  ) => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await axiosClient.get(
        `/api/users/firebase/${firebaseUser.uid}`
      );
      setUser(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        try {
          const emailResponse = await axiosClient.get(
            `/api/users/email/${encodeURIComponent(firebaseUser.email || "")}`
          );

          const updateResponse = await axiosClient.put(
            `/api/users/firebase-uid/${emailResponse.data.user_id}`,
            { fb_uid: firebaseUser.uid }
          );
          setUser(updateResponse.data);
        } catch (emailError: any) {
          if (emailError.response?.status === 404) {
            try {
              // Prioritize providedName (from signup form) over Firebase displayName
              const userName =
                providedName && providedName.trim()
                  ? providedName.trim()
                  : firebaseUser.displayName && firebaseUser.displayName.trim()
                    ? firebaseUser.displayName.trim()
                    : firebaseUser.email?.split("@")[0] || "User";

              const createResponse = await axiosClient.post("/api/users", {
                fb_uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: userName,
              });
              setUser(createResponse.data);
            } catch (createError: any) {
              console.error("Failed to create user in database:", createError);

              if (createError.response?.status === 500) {
                try {
                  const retryResponse = await axiosClient.get(
                    `/api/users/firebase/${firebaseUser.uid}`
                  );
                  setUser(retryResponse.data);
                } catch (retryError) {
                  console.error("Retry fetch also failed:", retryError);
                  // Use the same name prioritization logic
                  const userName =
                    providedName && providedName.trim()
                      ? providedName.trim()
                      : firebaseUser.displayName &&
                          firebaseUser.displayName.trim()
                        ? firebaseUser.displayName.trim()
                        : firebaseUser.email?.split("@")[0] || "User";

                  const tempUser = {
                    userId: 0,
                    fbUid: firebaseUser.uid,
                    email: firebaseUser.email || "",
                    name: userName,
                    avatarUrl: undefined,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };
                  setUser(tempUser);
                }
              } else {
                // Use the same name prioritization logic
                const userName =
                  providedName && providedName.trim()
                    ? providedName.trim()
                    : firebaseUser.displayName &&
                        firebaseUser.displayName.trim()
                      ? firebaseUser.displayName.trim()
                      : firebaseUser.email?.split("@")[0] || "User";

                const tempUser = {
                  userId: 0,
                  fbUid: firebaseUser.uid,
                  email: firebaseUser.email || "",
                  name: userName,
                  avatarUrl: undefined,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                setUser(tempUser);
              }
            }
          } else {
            console.error("Error fetching user by email:", emailError);
            // Use the same name prioritization logic
            const userName =
              providedName && providedName.trim()
                ? providedName.trim()
                : firebaseUser.displayName && firebaseUser.displayName.trim()
                  ? firebaseUser.displayName.trim()
                  : firebaseUser.email?.split("@")[0] || "User";

            const tempUser = {
              userId: 0,
              fbUid: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: userName,
              avatarUrl: undefined,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setUser(tempUser);
          }
        }
      } else {
        console.error("Failed to fetch user from database:", error);
        // Use the same name prioritization logic
        const userName =
          providedName && providedName.trim()
            ? providedName.trim()
            : firebaseUser.displayName && firebaseUser.displayName.trim()
              ? firebaseUser.displayName.trim()
              : firebaseUser.email?.split("@")[0] || "User";

        const tempUser = {
          userId: 0,
          fbUid: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: userName,
          avatarUrl: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUser(tempUser);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let lastUid: string | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const currentUid = firebaseUser?.uid || null;

      if (currentUid === lastUid && !loading) {
        return;
      }

      lastUid = currentUid;
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        await fetchOrCreateUser(firebaseUser, pendingUserName || undefined);
        setPendingUserName(null);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user && firebaseUser) {
        if (firebaseUser.emailVerified) {
          router.replace("/(tabs)");
        } else {
          router.replace("/verify-email");
        }
      } else {
        router.replace("/auth");
      }
    }
  }, [user, firebaseUser, loading]);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Set pending name BEFORE creating the user account
      setPendingUserName(name);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update the Firebase profile with the provided name
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // Reload the user to ensure the profile update is reflected
      await reload(userCredential.user);

      // Manually call fetchOrCreateUser with the correct name to ensure it's created properly
      await fetchOrCreateUser(userCredential.user, name);

      try {
        await sendEmailVerification(userCredential.user);
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
      }
    } catch (error) {
      setPendingUserName(null);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      throw error;
    }
  };

  const sendEmailVerificationFn = async () => {
    if (!firebaseUser) {
      throw new Error("No user is currently signed in");
    }

    if (firebaseUser.emailVerified) {
      throw new Error("Email is already verified");
    }

    try {
      await sendEmailVerification(firebaseUser);
    } catch (error: any) {
      console.error("Error sending verification email:", error);

      if (error.code === "auth/too-many-requests") {
        throw new Error(
          "Too many verification emails sent. Please wait a few minutes before trying again."
        );
      } else if (error.code === "auth/user-not-found") {
        throw new Error("User account not found. Please sign up again.");
      } else if (error.code === "auth/network-request-failed") {
        throw new Error(
          "Network error. Please check your internet connection and try again."
        );
      }

      throw error;
    }
  };
  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (!firebaseUser) {
      throw new Error("No user is currently signed in");
    }

    try {
      await reload(firebaseUser);
      const currentUser = auth.currentUser;
      if (currentUser) {
        setFirebaseUser(currentUser);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    firebaseUser,
    user,
    loading,
    signIn,
    signUp,
    logout,
    sendEmailVerification: sendEmailVerificationFn,
    sendPasswordReset,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
