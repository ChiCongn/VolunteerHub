import axios from "axios";
import { tokenService } from "./tokenService";
import { authService } from "../services/authService";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: false, // set true if using HttpOnly cookies instead
});

// Request interceptor: attach access token
api.interceptors.request.use((config) => {
    const token = tokenService.getAccess();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: handle 401 with refresh token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/auth/")
        ) {
            originalRequest._retry = true;

            try {
                const newAccessToken = await authService.refresh();
                if (newAccessToken) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed → force logout
                authService.logout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
