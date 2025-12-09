import { api } from "./axios";
import type { AuthResponse, RefreshResponse } from "../types/auth.type";

export const authApi = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
        const { data } = await api.post<AuthResponse>("/auth/login", {
            email,
            password,
        });
        return data;
    },

    register: async (
        username: string,
        email: string,
        password: string,
    ) => {
        const { data } = await api.post<AuthResponse>("/auth/register", {
            username,
            email,
            password,
        });
        return data;
    },

    logout: async (): Promise<void> => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            // Even if backend fails, still want client-side logout
            console.warn(
                "Logout API failed, proceeding with client logout",
                error
            );
        }
    },

    refresh: async (refreshToken: string): Promise<RefreshResponse> => {
        const { data } = await api.post<RefreshResponse>("/auth/refresh", {
            refreshToken,
        });
        return data;
    },
};
