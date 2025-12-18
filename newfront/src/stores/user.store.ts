import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/user.type";
import { UserRole, type UserStatus } from "../types/enum";

interface UserStore {
    // important data - required after login
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;

    // State mutators
    setUser: (user: User) => void;
    updateUser: (data: Partial<User>) => void;
    setTokens: (access: string, refresh?: string) => void;
    updateAvatar: (avatarUrl: string) => void;
    updateStatus: (status: UserStatus) => void;

    // Notification collection handlers
    addNotification: (notificationId: string) => void;
    removeNotification: (notificationId: string) => void;

    clearSession: () => void;

    // util selectors
    isAuthenticated: boolean;
    isAdmin: boolean;
    isManager: boolean;
    hasRole: (role: UserRole) => boolean;

    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
}

// Only persist lightweight fields to prevent bloated localStorage
const LIGHT_USER_FIELDS = [
    "id",
    "_id",
    "username",
    "email",
    "avatarUrl",
    "role",
    "status",
    "lastLogin",
    "updatedAt",
] as const;

export const useUserStore = create<UserStore>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,

            setUser: (user) => set({ user }),

            updateUser: (data) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...data } : null,
                })),

            setTokens: (access, refresh) =>
                set({
                    accessToken: access,
                    refreshToken: refresh ?? get().refreshToken,
                }),

            updateAvatar: (avatarUrl) =>
                set((state) => ({
                    user: state.user ? { ...state.user, avatarUrl } : null,
                })),

            updateStatus: (status) =>
                set((state) => ({
                    user: state.user ? { ...state.user, status } : null,
                })),

            addNotification: (notificationId) =>
                set((state) => ({
                    user: state.user
                        ? {
                              ...state.user,
                              notifications: [
                                  ...state.user.notifications,
                                  notificationId,
                              ],
                          }
                        : null,
                })),

            removeNotification: (notificationId) =>
                set((state) => ({
                    user: state.user
                        ? {
                              ...state.user,
                              notifications: state.user.notifications.filter(
                                  (id) => id !== notificationId
                              ),
                          }
                        : null,
                })),

            clearSession: () =>
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                }),

            // Computed selectors
            get isAuthenticated() {
                return !!get().accessToken && !!get().user;
            },
            get isAdmin() {
                return get().user?.role === UserRole.Admin;
            },
            get isManager() {
                return get().user?.role === UserRole.EventManager;
            },
            hasRole: (role) => get().user?.role === role,
            _hasHydrated: false,
            setHasHydrated: (state) => set({ _hasHydrated: state }),
        }),
        {
            name: "volunteerhub-session",
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
            partialize: (state) => ({
                user: state.user
                    ? Object.fromEntries(
                          Object.entries(state.user).filter(([key]) =>
                              LIGHT_USER_FIELDS.includes(key as any)
                          )
                      )
                    : null,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
            }),
        }
    )
);
