import { useAuth } from "@/components/context/AuthContext";
import { useUserStore } from "@/stores/user.store";

export function useAuthState() {
  const { user: authUser, isAuthenticated, logout, login, accessToken } = useAuth();
  const { user: storeUser } = useUserStore();

  const user = authUser || storeUser;

  return {
    user,
    isAuthenticated,
    logout,
    login,
    accessToken,
    userName: user?.username || "Guest",
    userEmail: user?.email || "",
    userAvatar: user?.avatarUrl || "",
  };
}
