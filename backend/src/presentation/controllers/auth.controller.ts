import { Request, Response } from "express";
import { authService, AuthService } from "../../application/services/auth.service";
import {
    AccountLockedError,
    AccountPendingError,
    EmailAlreadyExistsError,
    InvalidCredentialsError,
    RefreshTokenRevokedError,
} from "../../domain/errors/auth.error";
import { UserNotFoundError } from "../../domain/errors/user.error";
import logger from "../../logger";
import { hashPassword } from "../../utils/hash";

export class AuthController {
    constructor(private readonly authService: AuthService) {}

    register = async (req: Request, res: Response) => {
        logger.info(
            { body: req.body, action: "register" },
            "[AuthController] Register request received"
        );

        try {
            const { username, email, password } = req.body;
            const passwordHash = await hashPassword(password);
            const result = await this.authService.register({ username, email, passwordHash });
            return res.status(201).json(result);
        } catch (err) {
            if (err instanceof EmailAlreadyExistsError) {
                logger.warn(
                    { email: req.body.email, action: "register" },
                    "[AuthController] Email already exists"
                );
                return res.status(409).json({ message: `Email ${req.body.email} already exists` }); // Conflict
            }

            if (err instanceof UserNotFoundError) {
                logger.error(
                    { body: req.body, action: "register" },
                    "[AuthController] User not found"
                );
                return res.status(404).json({ message: "User not found!" });
            }

            logger.error(
                { error: err, action: "register" },
                "[AuthController] Registration failed unexpectedly"
            );
            console.log(err);
            // Generic fallback for unexpected errors
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    login = async (req: Request, res: Response) => {
        logger.info(
            { email: req.body.email, action: "login" },
            "[AuthController] Login request received"
        );

        try {
            const { email, password } = req.body;
            const tokens = await this.authService.login({ email, password });

            return res.status(200).json(tokens);
        } catch (err) {
            if (err instanceof UserNotFoundError) {
                logger.error(
                    { email: req.body.email, action: "login" },
                    "[AuthController] User not found"
                );
                return res.status(403).json({ message: "User not found" });
            }
            if (err instanceof InvalidCredentialsError) {
                logger.error(
                    { email: req.body.email, action: "login" },
                    "[AuthController] Invalid credentials"
                );

                return res.status(400).json({ message: "Invalid creadential" });
            }
            if (err instanceof AccountLockedError) {
                logger.error(
                    { email: req.body.email, action: "login" },
                    "[AuthController] Account is locked"
                );

                return res.status(403).json({ message: "Account is locked" });
            }
            if (err instanceof AccountPendingError) {
                logger.error(
                    { email: req.body.email, action: "login" },
                    "[AuthController] Account pending approval"
                );

                return res.status(403).json({ message: "Account pending approval" });
            }

            logger.error(
                { error: err, email: req.body.email, action: "login" },
                "[AuthController] Login failed"
            );
            console.log(err);
            return res.status(401).json({ message: "Login failed" });
        }
    };

    refresh = async (req: Request, res: Response) => {
        logger.info({ action: "refresh" }, "[AuthController] Refresh request received");

        try {
            const { refreshToken } = req.body;
            const tokens = await this.authService.refresh(refreshToken);
            return res.status(200).json(tokens);
        } catch (err) {
            if (err instanceof RefreshTokenRevokedError) {
                logger.warn({ action: "refresh" }, "[AuthController] Refresh token revoked");
                return res.status(401).json({ message: err.message });
            }

            logger.error(
                { error: err, action: "refresh" },
                "[AuthController] Token refresh failed"
            );
            return res.status(400).json({ message: "Failed to refresh access token" });
        }
    };

    async logout(req: Request, res: Response) {
        logger.info({ action: "logout" }, "[AuthController] Logout request received");

        try {
            const { refreshToken } = req.body;
            await this.authService.logout(refreshToken);
            return res.status(204).send();
        } catch (err) {
            logger.error({ error: err, action: "logout" }, "[AuthController] Logout failed");
            return res.status(400).json({ message: "Logout failed" });
        }
    }
}

export const authController = new AuthController(authService);
