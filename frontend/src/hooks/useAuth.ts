import { useUserStore } from "../stores/user.store";

export function useAuth() {
    const user = useUserStore((s) => s.user);
    const isAuthenticated = useUserStore(
        (s) => !!s.user && !!s.accessToken
    );

    return {
        user,
        isAuthenticated,
    };
}
