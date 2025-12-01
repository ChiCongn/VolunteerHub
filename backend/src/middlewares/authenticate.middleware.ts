import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import logger from "../logger";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            logger.warn(
                {
                    reason: "Missing or invalid Authorization header",
                    authHeader,
                    url: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                },
                "[Auth] Unauthorized request"
            );
            return res.status(401).json({ message: "Missing or invalid Authorization header" });
        }

        const token = authHeader.split(" ")[1];
        const user = verifyAccessToken(token);

        req.user = user;
        next();
    } catch (err) {
        logger.error(
            {
                error: err,
                url: req.originalUrl,
                method: req.method,
                ip: req.ip,
            },
            "[Auth] Unexpected authenticate error"
        );
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
};
