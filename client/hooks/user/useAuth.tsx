import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User } from "@/models/User";
import { axiosClient } from "@/utils/axiosClient";

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosClient.get<User[]>("/api/users/all");
        setUsers(res.data);
        setUser(res.data[0] ?? null);
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    };

    fetchUsers();
  }, []);

  const switchUser = (userId: number) => {
    const selected = users.find((u) => u.userId === userId);
    if (selected) {
      setUser(selected);
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
    console.warn("useAuth must be used within an AuthProvider");
    return { user: null, switchUser: () => {}, users: [] };
  }
  return context;
};
