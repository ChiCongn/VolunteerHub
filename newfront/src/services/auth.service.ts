import type { AuthResponse, RefreshResponse } from "@/types/auth.type";
import { tokenService } from "./token.service";
import apiClient from "@/lib/api-client";

export const authService = {
    async login(email: string, password: string) {
        const { data } = await apiClient.post<AuthResponse>("/auth/login", {
            email,
            password,
        });
        tokenService.save({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
        });
        return data;
    },

    async register(username: string, email: string, password: string) {
        const { data } = await apiClient.post<AuthResponse>("/auth/register", {
            username,
            email,
            password,
        });
        tokenService.save({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
        });
        return data;
    },

    async logout() {
        try {
            await apiClient.post("/auth/logout");
        } catch (error) {
            // Even if backend fails, still want client-side logout
            console.warn(
                "Logout API failed, proceeding with client logout",
                error
            );
        }
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
            const { data } = await apiClient.post<RefreshResponse>(
                "/auth/refresh",
                {
                    refreshToken,
                }
            );
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
