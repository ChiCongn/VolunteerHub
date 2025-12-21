import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "@/types/user.type";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (user: User, accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Khởi tạo: Lấy dữ liệu từ localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedUser = localStorage.getItem("auth_user");
        const savedAccessToken = localStorage.getItem("access_token");
        const savedRefreshToken = localStorage.getItem("refresh_token");

        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        if (savedAccessToken) {
          setAccessToken(savedAccessToken);
        }
        if (savedRefreshToken) {
          setRefreshToken(savedRefreshToken);
        }
      } catch (error) {
        console.error("Failed to initialize auth from localStorage:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (
    userData: User,
    newAccessToken: string,
    newRefreshToken?: string
  ) => {
    setUser(userData);
    setAccessToken(newAccessToken);
    if (newRefreshToken) {
      setRefreshToken(newRefreshToken);
    }

    // Lưu vào localStorage
    localStorage.setItem("auth_user", JSON.stringify(userData));
    localStorage.setItem("access_token", newAccessToken);
    if (newRefreshToken) {
      localStorage.setItem("refresh_token", newRefreshToken);
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    // Xóa khỏi localStorage
    localStorage.removeItem("auth_user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("auth_user", JSON.stringify(updatedUser));
    }
  };

  const isAuthenticated = !!accessToken && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        login,
        logout,
        loading,
        isAuthenticated,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
