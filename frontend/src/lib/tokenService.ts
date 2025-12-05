import { STORAGE_KEYS } from "./constants";

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export const tokenService = {
    getAccess(): string | null {
        return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    },

    getRefresh(): string | null {
        return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    },

    save(tokens: AuthTokens): void {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
        if (tokens.refreshToken) {
            localStorage.setItem(
                STORAGE_KEYS.REFRESH_TOKEN,
                tokens.refreshToken
            );
        }
    },

    clear(): void {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    },

    isAuthenticated(): boolean {
        return !!this.getAccess();
    },
};
