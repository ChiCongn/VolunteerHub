import { authApi } from "../lib/auth.api";
import { tokenService } from "../lib/tokenService";

export const authService = {
    async login(email: string, password: string) {
        const data = await authApi.login(email, password);
        tokenService.save({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
        });
        return data;
    },

    async register(
        username: string,
        email: string,
        password: string,
    ) {
        const data = await authApi.register(
            username,
            email,
            password,
        );
        tokenService.save({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
        });
        return data;
    },

    async logout() {
        await authApi.logout();
        tokenService.clear();
        window.location.href = "/login";
    },

    async refresh(): Promise<string | null> {
        const refreshToken = tokenService.getRefresh();
        if (!refreshToken) {
            this.logout();
            return null;
        }

        try {
            const data = await authApi.refresh(refreshToken);
            tokenService.save({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            });
            return data.accessToken;
        } catch (error) {
            this.logout(); // Critical: force logout if refresh fails
            throw error;
        }
    },

    isAuthenticated(): boolean {
        return tokenService.isAuthenticated();
    },
};
