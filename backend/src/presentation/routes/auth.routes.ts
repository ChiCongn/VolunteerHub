import { Router, Request, Response } from "express";
import { validate } from "../../middlewares/validation.middleware";
import { LoginCredentialsSchema } from "../validators/auth/login.schema";
import { RegisterSchema } from "../validators/auth/register.schema";
import { mockController } from "../controllers/mock.controller";

export const authRoutes = Router();

authRoutes.post(
    "/login",
    validate(LoginCredentialsSchema),
    mockController(async (req: Request, res: Response) => {
        res.status(200).json({
            token: "fake-jwt-token-123456789",
            user: {
                id: "1",
                email: req.body.email,
                name: "Mock User",
                role: "volunteer",
            },
        });
    })
);

authRoutes.post(
    "/register",
    validate(RegisterSchema),
    mockController(async (req: Request, res: Response) => {
        res.status(201).json({
            message: "Đăng ký thành công! Vui lòng kiểm tra email.",
            user: {
                id: "999",
                username: req.body.username,
                email: req.body.email,
                role: "volunteer",
                status: "active",
            },
        });
    })
);
