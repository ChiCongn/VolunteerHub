import { CreateRefreshTokenDto } from "../../application/dtos/refresh-token/create-refresh-token.dto";
import { RefreshTokenDto } from "../../application/dtos/refresh-token/refresh-token.dto";

export interface IRefreshTokenRepository {
    create(data: CreateRefreshTokenDto): Promise<{ id: string; token: string }>;

    findByToken(token: string): Promise<RefreshTokenDto>;

    deleteToken(token: string): Promise<void>;

    revoke(token: string): Promise<void>;
}
