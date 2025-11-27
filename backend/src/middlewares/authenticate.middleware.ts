import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { AccessTokenPayload } from "../utils/jwt";
import { UserRepository } from "../infrastructure/repositories/user.repository";
import { PrismaClient } from "../infrastructure/prisma/generated/client";

declare module "express-serve-static-core" {
    interface Request {
        user?: any; // replace `any` with your User type
    }
}

const prisma = new PrismaClient();
const userRepo = new UserRepository(prisma);

// Middleware to protect routes with JWT access token
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Missing or invalid Authorization header" });
        }

        const token = authHeader.split(" ")[1];
        const payload = verifyAccessToken(token);

        // Check user exist until now
        const user = userRepo.findById(payload.sub);
        // Attach user info to request object
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // 3. Attach user to request object
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
};
