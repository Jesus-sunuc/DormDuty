// LEGACY: This is the old user switching system for testing/development
// TODO: Replace with Firebase authentication context throughout the app
// Currently still used by various components that haven't been migrated yet

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User } from "@/models/User";
import { axiosClient } from "@/utils/axiosClient";
import { useQueryClient } from "@tanstack/react-query";
import { useFirebaseAuth } from "@/contexts/AuthContext";

type AuthContextType = {
  user: User | null;
  switchUser: (userId: number) => void;
  users: User[];
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  switchUser: () => {},
  users: [],
});

export const AuthProvider = (props: { children: ReactNode }) => {
  const children = props?.children;
  const queryClient = useQueryClient();
  const { user: firebaseUser } = useFirebaseAuth(); // Get current Firebase user

  const usersState = useState<User[]>([]);
  const users = usersState[0];
  const setUsers = usersState[1];

  const userState = useState<User | null>(null);
  const user = userState[0];
  const setUser = userState[1];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosClient.get<User[]>("/api/users/all");
        setUsers(res.data);

        // If Firebase user exists, find them in the user list and set as current user
        if (firebaseUser) {
          const currentUser = res.data.find(
            (u) => u.fbUid === firebaseUser.fbUid
          );
          setUser(currentUser || res.data[0] || null);
        } else {
          setUser(res.data[0] ?? null);
        }
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    };

    fetchUsers();
  }, [firebaseUser]); // Re-fetch when Firebase user changes

  const switchUser = (userId: number) => {
    const selected = users.find((u) => u.userId === userId);
    if (selected) {
      setUser(selected);

      // Invalidate all user-dependent queries when switching users
      queryClient.invalidateQueries({ queryKey: ["membership"] });
      queryClient.invalidateQueries({ queryKey: ["chore-swap"] });
      queryClient.invalidateQueries({ queryKey: ["chores"] });
    }
  };

  return (
    <AuthContext.Provider value={{ user, switchUser, users }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
