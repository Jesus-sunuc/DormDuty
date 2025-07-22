import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
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
          const createResponse = await axiosClient.post("/api/users", {
            fb_uid: firebaseUser.uid,
            email: firebaseUser.email,
            name:
              providedName ||
              firebaseUser.displayName ||
              firebaseUser.email?.split("@")[0] ||
              "User",
          });
          setUser(createResponse.data);
        } catch (createError) {
          console.error("Failed to create user in database:", createError);
          const tempUser = {
            userId: 0,
            fbUid: firebaseUser.uid,
            email: firebaseUser.email || "",
            name:
              providedName ||
              firebaseUser.displayName ||
              firebaseUser.email?.split("@")[0] ||
              "User",
            avatarUrl: undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setUser(tempUser);
        }
      } else {
        console.error("Failed to fetch user from database:", error);
        const tempUser = {
          userId: 0,
          fbUid: firebaseUser.uid,
          email: firebaseUser.email || "",
          name:
            providedName ||
            firebaseUser.displayName ||
            firebaseUser.email?.split("@")[0] ||
            "User",
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
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/auth");
      }
    }
  }, [user, loading]);

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
      setPendingUserName(name);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCredential.user, {
        displayName: name,
      });
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

  const value: AuthContextType = {
    firebaseUser,
    user,
    loading,
    signIn,
    signUp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
